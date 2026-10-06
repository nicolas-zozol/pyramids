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

const shapesUnder = (root: string) => [
  ...CONTENT_SHAPES.map((shape) => `${root}/${shape}`),
  ...CONTENT_SHAPES.map((shape) => `l/$locale/${root}/${shape}`),
];

describe('pageList', () => {
  it('lists the landing page and the not-found page ahead of the content URLs', () => {
    expect(pageList(['/articles', '/articles/c/web'])).toEqual([
      { path: '/' },
      { path: '/404' },
      { path: '/articles' },
      { path: '/articles/c/web' },
    ]);
  });
});

describe('missingRouteFiles', () => {
  it('finds nothing missing when the twelve content routes sit under the content root', async () => {
    const routes = await routesDirectoryWith(shapesUnder('articles'));

    expect(missingRouteFiles(routes, 'articles')).toEqual([]);
  });

  it('names every route file the content root expects and the tree lacks', async () => {
    const routes = await routesDirectoryWith(shapesUnder('articles'));

    expect(missingRouteFiles(routes, 'notes')).toEqual(shapesUnder('notes'));
  });

  it('holds the site’s own route tree against its own content root', () => {
    expect(missingRouteFiles('src/routes', 'articles')).toEqual([]);
  });
});

describe('assertRouteFilesFollow', () => {
  it('throws naming the content root and the missing route files', async () => {
    const routes = await routesDirectoryWith(
      shapesUnder('articles').filter((file) => !file.endsWith('$slug.tsx')),
    );

    expect(() => assertRouteFilesFollow(routes, 'articles')).toThrow(
      /'articles'.*articles\/\$slug\.tsx.*articles\/c\/\$category\/\$slug\.tsx/s,
    );
  });

  it('passes silently when the tree follows the content root', async () => {
    const routes = await routesDirectoryWith(shapesUnder('articles'));

    expect(() => assertRouteFilesFollow(routes, 'articles')).not.toThrow();
  });
});
