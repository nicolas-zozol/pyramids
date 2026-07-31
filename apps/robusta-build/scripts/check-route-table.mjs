/**
 * AC-URLSCHEME-42: the built route table and the URL set the base derives from
 * the corpus are the same set. No URL is pregenerated that the site then
 * refuses, and none is served that the derivation does not contain.
 *
 * Run after `next build`. It reads the prerender manifest — what the site
 * actually produced — and compares it against `urlSet` applied to the article
 * index, which is what every route pregenerates from.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const compiled = join(app, '.routing-dist');

const { buildUrl } = await import('@robusta/pyramids-routing');
const { urlScheme } = await import(join(compiled, 'routing/scheme.js'));
const { contentUrls } = await import(join(compiled, 'routing/content-urls.js'));

const derived = new Set(
  (await contentUrls()).map((page) => buildUrl(urlScheme, page)),
);

const manifest = JSON.parse(
  readFileSync(join(app, '.next/prerender-manifest.json'), 'utf8'),
);

/**
 * `/` is the landing page and `/_not-found` is Next's own: neither belongs to
 * the content section, and the derivation deliberately produces no landing URL.
 */
const OUTSIDE_THE_CONTENT_SECTION = new Set(['/', '/_not-found']);

const built = new Set(
  Object.keys(manifest.routes).filter(
    (route) => !OUTSIDE_THE_CONTENT_SECTION.has(route),
  ),
);

const pregeneratedButNotDerived = [...built].filter((url) => !derived.has(url));
const derivedButNotBuilt = [...derived].filter((url) => !built.has(url));

if (pregeneratedButNotDerived.length > 0 || derivedButNotBuilt.length > 0) {
  console.error('The route table and the derived URL set disagree.');
  for (const url of pregeneratedButNotDerived) {
    console.error(`  built but not derived: ${url}`);
  }
  for (const url of derivedButNotBuilt) {
    console.error(`  derived but not built: ${url}`);
  }
  process.exit(1);
}

console.log(
  `route table: ${built.size} content URLs built, and the derivation contains exactly those.`,
);
