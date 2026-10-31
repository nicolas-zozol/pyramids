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

const sevenRouteFiles = (root: string) => [
  '$locale/index.tsx',
  ...CONTENT_SHAPES.map((shape) => `$locale/${root}/${shape}`),
];

describe('pageList', () => {
  it('lists the landing pages, then the not-found page, then the content URLs, and nothing at /', () => {
    expect(
      pageList(['/en', '/fr', '/es'], ['/en/articles', '/en/articles/c/web']),
    ).toEqual([
      { path: '/en' },
      { path: '/fr' },
      { path: '/es' },
      { path: '/404' },
      { path: '/en/articles' },
      { path: '/en/articles/c/web' },
    ]);
  });

  it('never lists the bare site root, which the host redirects', () => {
    const paths = pageList(['/en'], ['/en/articles']).map(({ path }) => path);

    expect(paths).not.toContain('/');
  });
});

describe('missingRouteFiles', () => {
  it('finds nothing missing when the landing and the six content shapes sit under $locale', async () => {
    const routes = await routesDirectoryWith(sevenRouteFiles('articles'));

    expect(missingRouteFiles(routes, 'articles')).toEqual([]);
  });

  it('names every route file the content root expects and the tree lacks', async () => {
    const routes = await routesDirectoryWith(sevenRouteFiles('articles'));

    expect(missingRouteFiles(routes, 'notes')).toEqual(
      sevenRouteFiles('notes').filter((file) => file !== '$locale/index.tsx'),
    );
  });

  it('names the landing route when it is missing', async () => {
    const routes = await routesDirectoryWith(
      sevenRouteFiles('articles').filter(
        (file) => file !== '$locale/index.tsx',
      ),
    );

    expect(missingRouteFiles(routes, 'articles')).toEqual([
      '$locale/index.tsx',
    ]);
  });

  it('holds the site’s own route tree against its own content root', () => {
    expect(missingRouteFiles('src/routes', 'articles')).toEqual([]);
  });
});

describe('assertRouteFilesFollow', () => {
  it('throws naming the content root and the missing route files', async () => {
    const routes = await routesDirectoryWith(
      sevenRouteFiles('articles').filter((file) => !file.endsWith('$slug.tsx')),
    );

    expect(() => assertRouteFilesFollow(routes, 'articles')).toThrow(
      /'articles' has no route file at: \$locale\/articles\/\$slug\.tsx, \$locale\/articles\/c\/\$category\/\$slug\.tsx \(under /,
    );
  });

  it('passes silently when the tree follows the content root', async () => {
    const routes = await routesDirectoryWith(sevenRouteFiles('articles'));

    expect(() => assertRouteFilesFollow(routes, 'articles')).not.toThrow();
  });
});
