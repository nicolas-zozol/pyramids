/**
 * The page list the prerender walks: `/`, `/404`, then every URL the corpus
 * derives, built with the scheme's single builder. It reads the seams compiled
 * under `.routing-dist`, and refuses a route tree that does not follow the
 * configured content root.
 *
 * Design: features/pyramid-v2-epic/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-21, R-TANSTACK-23, R-TANSTACK-26
 */
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const compiled = join(app, '.routing-dist');

const CONTENT_SHAPES = [
  'index.tsx',
  'p/$n.tsx',
  '$slug.tsx',
  'c/$category/index.tsx',
  'c/$category/p/$n.tsx',
  'c/$category/$slug.tsx',
];

/** `/`, `/404`, then every URL contentUrls derives (R-URLSCHEME-30 checked first). */
export async function prerenderPages() {
  const { buildUrl } = await import('@robusta/pyramids-routing');
  const { urlScheme } = await import(join(compiled, 'routing/scheme.js'));
  const { contentUrls } = await import(
    join(compiled, 'routing/content-urls.js')
  );

  assertRouteFilesFollow(join(app, 'src/routes'), urlScheme.contentRoot);

  const urls = (await contentUrls()).map((page) => buildUrl(urlScheme, page));
  return pageList(urls);
}

/** The landing page and the not-found page, then the content URLs in order. */
export function pageList(contentUrls) {
  return ['/', '/404', ...contentUrls].map((path) => ({ path }));
}

/** The route files the content root expects under `routesDirectory` and does not find. */
export function missingRouteFiles(routesDirectory, contentRoot) {
  const expected = [
    ...CONTENT_SHAPES.map((shape) => `${contentRoot}/${shape}`),
    ...CONTENT_SHAPES.map((shape) => `l/$locale/${contentRoot}/${shape}`),
  ];
  return expected.filter((file) => !existsSync(join(routesDirectory, file)));
}

/** Throws naming the content root and the missing route files when they diverge. */
export function assertRouteFilesFollow(routesDirectory, contentRoot) {
  const missing = missingRouteFiles(routesDirectory, contentRoot);
  if (missing.length > 0) {
    throw new Error(
      `The configured content root '${contentRoot}' has no route file at: ${missing.join(', ')} (under ${routesDirectory})`,
    );
  }
}
