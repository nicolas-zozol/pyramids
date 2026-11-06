/**
 * Emits the v1-to-v2 mapping as JSON, next to the module that computes it.
 *
 * The output is committed so the mapping stays written down and reviewable
 * (R-URLSCHEME-14): a diff shows the map changing when the corpus does. Nothing
 * in the build reads this file: `scripts/emit-redirects.mjs` computes the same
 * map and serves it as `dist/client/_redirects`.
 *
 * Design: features/pyramid-v2-epic/__done/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-09
 * Design: features/pyramid-v2-epic/__done/restore-v1-urls/restore-v1-urls.design.md
 * Requirements: R-RESTOREV1-42
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const app = resolve(here, '..');
const source = join(app, 'src');

const { urlScheme } = await import(join(source, 'routing/scheme.ts'));
const { v1UrlMap } = await import(join(source, 'routing/v1-url-map.ts'));
const { getArticleIndex } = await import(join(source, 'content/article-index.ts'));

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
