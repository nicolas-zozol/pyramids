/**
 * The page list the prerender walks: the landing page of every Locale, `/`
 * first, written as `index.html`, then `/404`, then every URL the corpus
 * derives, built with the scheme's single builder. It reads the seams compiled
 * under `.routing-dist`, and refuses a route tree that does not follow the
 * configured content root.
 *
 * Design: features/pyramid-v2-epic/default-locale-at-root/default-locale-at-root.design.md
 * Requirements: R-ROOTLOCALE-24
 * Design: features/pyramid-v2-epic/__done/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-21, R-TANSTACK-23, R-TANSTACK-26
 * Design: features/pyramid-v2-epic/multilingual-site/multilingual-site.design.md
 * Requirements: R-MULTILINGUAL-25
 */
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const compiled = join(app, '.routing-dist');

const LOCALE_SEGMENT = '{-$locale}';
const LAYOUT_ROUTE = `${LOCALE_SEGMENT}/route.tsx`;
const LANDING_ROUTE = `${LOCALE_SEGMENT}/index.tsx`;
const CONTENT_SHAPES = [
  'index.tsx',
  'p/$n.tsx',
  '$slug.tsx',
  'c/$category/index.tsx',
  'c/$category/p/$n.tsx',
  'c/$category/$slug.tsx',
];

/** The landing pages, `/` first, `/404`, then the content URLs; route files checked first. */
export async function prerenderPages() {
  const { buildUrl, landingPages } = await import(
    join(compiled, 'routing/url-scheme/index.js')
  );
  const { urlScheme } = await import(join(compiled, 'routing/scheme.js'));
  const { contentUrls } = await import(
    join(compiled, 'routing/content-urls.js')
  );

  assertRouteFilesFollow(join(app, 'src/routes'), urlScheme.contentRoot);

  const landings = landingPages(urlScheme).map((page) =>
    buildUrl(urlScheme, page),
  );
  const content = (await contentUrls()).map((page) =>
    buildUrl(urlScheme, page),
  );
  return pageList(landings, content);
}

/** The landing pages, the not-found page, then the content URLs, in order. */
export function pageList(landingUrls, contentUrls) {
  return [...landingUrls, '/404', ...contentUrls].map((path) => ({ path }));
}

/** The layout route and the seven route files under `{-$locale}` that `routesDirectory` lacks. */
export function missingRouteFiles(routesDirectory, contentRoot) {
  const expected = [
    LAYOUT_ROUTE,
    LANDING_ROUTE,
    ...CONTENT_SHAPES.map(
      (shape) => `${LOCALE_SEGMENT}/${contentRoot}/${shape}`,
    ),
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
