import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import {
  assertRouteFilesFollow,
  missingRouteFiles,
  pageList,
} from './prerender-pages.mjs';

const CONTENT_SHAPES = [
  'index.tsx',
  'p/$n.tsx',
  '$slug.tsx',
  'c/$category/index.tsx',
  'c/$category/p/$n.tsx',
  'c/$category/$slug.tsx',
];

const temporary: string[] = [];

afterAll(async () => {
  await Promise.all(
    temporary
      .splice(0)
      .map((path) => rm(path, { recursive: true, force: true })),
  );
});

async function routesDirectoryWith(files: string[]): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), 'robusta-build-routes-'));
  temporary.push(directory);
  await Promise.all(
    files.map(async (file) => {
      await mkdir(dirname(join(directory, file)), { recursive: true });
      await writeFile(join(directory, file), '');
    }),
  );
  return directory;
}

const LAYOUT_ROUTE = '{-$locale}/route.tsx';
const LANDING_ROUTE = '{-$locale}/index.tsx';

const routeFiles = (root: string) => [
  LAYOUT_ROUTE,
  LANDING_ROUTE,
  ...CONTENT_SHAPES.map((shape) => `{-$locale}/${root}/${shape}`),
];

describe('pageList', () => {
  it('lists the landing pages, `/` first, then the not-found page, then the content URLs', () => {
    expect(
      pageList(['/', '/fr', '/es'], ['/articles', '/articles/c/web']),
    ).toEqual([
      { path: '/' },
      { path: '/fr' },
      { path: '/es' },
      { path: '/404' },
      { path: '/articles' },
      { path: '/articles/c/web' },
    ]);
  });
});

describe('missingRouteFiles', () => {
  it('finds nothing missing when the layout, the landing and the six content shapes sit under {-$locale}', async () => {
    const routes = await routesDirectoryWith(routeFiles('articles'));

    expect(missingRouteFiles(routes, 'articles')).toEqual([]);
  });

  it('names every route file the content root expects and the tree lacks', async () => {
    const routes = await routesDirectoryWith(routeFiles('articles'));

    expect(missingRouteFiles(routes, 'notes')).toEqual(
      routeFiles('notes').filter(
        (file) => file !== LAYOUT_ROUTE && file !== LANDING_ROUTE,
      ),
    );
  });

  it('names the landing route when it is missing', async () => {
    const routes = await routesDirectoryWith(
      routeFiles('articles').filter((file) => file !== LANDING_ROUTE),
    );

    expect(missingRouteFiles(routes, 'articles')).toEqual([LANDING_ROUTE]);
  });

  it('names the layout route that resolves the Locale segment when it is missing', async () => {
    const routes = await routesDirectoryWith(
      routeFiles('articles').filter((file) => file !== LAYOUT_ROUTE),
    );

    expect(missingRouteFiles(routes, 'articles')).toEqual([LAYOUT_ROUTE]);
  });

  it('names the route files of the former $locale directory as missing', async () => {
    const routes = await routesDirectoryWith(
      routeFiles('articles').map((file) =>
        file.replace('{-$locale}', '$locale'),
      ),
    );

    expect(missingRouteFiles(routes, 'articles')).toEqual(
      routeFiles('articles'),
    );
  });

  it('holds the site’s own route tree against its own content root', () => {
    expect(missingRouteFiles('src/routes', 'articles')).toEqual([]);
  });
});

describe('assertRouteFilesFollow', () => {
  it('throws naming the content root and the missing route files', async () => {
    const routes = await routesDirectoryWith(
      routeFiles('articles').filter((file) => !file.endsWith('$slug.tsx')),
    );

    expect(() => assertRouteFilesFollow(routes, 'articles')).toThrow(
      /'articles' has no route file at: \{-\$locale\}\/articles\/\$slug\.tsx, \{-\$locale\}\/articles\/c\/\$category\/\$slug\.tsx \(under /,
    );
  });

  it('passes silently when the tree follows the content root', async () => {
    const routes = await routesDirectoryWith(routeFiles('articles'));

    expect(() => assertRouteFilesFollow(routes, 'articles')).not.toThrow();
  });
});
