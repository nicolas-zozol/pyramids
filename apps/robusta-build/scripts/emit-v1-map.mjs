/**
 * Emits the v1-to-v2 mapping as JSON, next to the module that computes it.
 *
 * The output is committed so the mapping stays written down and reviewable
 * (R-URLSCHEME-14): a diff shows the map changing when the corpus does. Nothing
 * in the build reads it and no redirect is served from it; restore-v1-urls is
 * the item that will.
 *
 * Design: features/pyramid-v2-epic/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-09
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
  generatedBy: 'scripts/emit-v1-map.mjs — do not edit by hand',
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
