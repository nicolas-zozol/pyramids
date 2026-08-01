/**
 * Mirrors the files the published articles reference into the site's asset root.
 *
 * The corpus is not under `public/` and a site must not read its content source
 * while serving a request (BR-PYRAMID-7), so the referenced files become
 * ordinary static files before the build starts. `next build` collects `public/`
 * when it starts, which is why this runs ahead of it and not beside it — the
 * ordering is not a preference.
 *
 * It carries no logic of its own: what to copy and where is the base's, and
 * `src/content/corpus.ts` is where the site says it. Like
 * `scripts/emit-redirects.mjs`, it reuses the compile that step performs, and
 * imports the base by name so it reads `dist/` like everything else.
 *
 * It is not a watcher. An image added during a `next dev` session reaches the
 * site on the next `yarn copy:assets`, which the dev script runs at startup.
 */
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const compiled = join(app, '.routing-dist');

const { copyCorpusAssets } = await import('@robusta/pyramids-content');
const { corpus } = await import(join(compiled, 'content/corpus.js'));

const copied = await copyCorpusAssets(corpus);

console.log(
  `article images: ${copied.length} files published under ${corpus.assets.urlPrefix}/ → ${corpus.assets.publishDir}`,
);
