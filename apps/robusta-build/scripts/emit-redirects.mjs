/**
 * Emits the v1-to-v2 mapping as JSON, next to the module that computes it.
 *
 * Why a script rather than an import: `next.config.ts` is loaded outside the
 * webpack pipeline, by Next's own SWC require hook, which resolves import paths
 * verbatim. This repository's local TypeScript imports end in `.js`, and no
 * such file exists on disk, so the config cannot follow the chain to
 * `v1-url-map.ts` — and even extensionless it would die on the design system's
 * PNG import that `seopyramids.config.ts` resolves through the bundler. The
 * design names this fallback, and it costs one script and no redesign because
 * the mapping module carries no Next and no React import.
 *
 * The output is committed. The mapping is meant to be written down and
 * reviewable before any redirect ships (R-URLSCHEME-14), and a JSON file in the
 * tree is exactly that: a diff shows the map changing when the corpus does.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const app = resolve(here, '..');
const compiled = join(app, '.routing-dist');

const { urlScheme } = await import(join(compiled, 'routing/scheme.js'));
const { v1UrlMap } = await import(join(compiled, 'routing/v1-url-map.js'));
const { getArticleIndex } = await import(join(compiled, 'content/article-index.js'));

const rows = v1UrlMap(urlScheme, await getArticleIndex());

const output = {
  generatedBy: 'scripts/emit-redirects.mjs — do not edit by hand',
  contentRoot: urlScheme.contentRoot,
  defaultLocale: urlScheme.defaultLocale,
  otherLocales: urlScheme.otherLocales,
  counts: {
    total: rows.length,
    permanent: rows.filter((row) => row.destination.kind === 'permanent').length,
    gone: rows.filter((row) => row.destination.kind === 'gone').length,
    none: rows.filter((row) => row.destination.kind === 'none').length,
  },
  rows,
};

const target = join(app, 'src/routing/v1-url-map.generated.json');
mkdirSync(dirname(target), { recursive: true });
writeFileSync(target, `${JSON.stringify(output, null, 2)}\n`);

console.log(
  `v1 mapping: ${output.counts.total} rows (${output.counts.permanent} permanent, ${output.counts.gone} gone, ${output.counts.none} none) → src/routing/v1-url-map.generated.json`,
);
