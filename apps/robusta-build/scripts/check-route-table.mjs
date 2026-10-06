/**
 * The built route table and the URL set the corpus derives are the same set,
 * and every article page left its data file beside the notes feed's
 * (AC-URLSCHEME-42). Run after `vite build`, on what the prerender wrote under
 * `dist/client`.
 *
 * Design: features/pyramid-v2-epic/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-24, R-TANSTACK-25, R-TANSTACK-26
 */
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const OUTSIDE_THE_CONTENT_SECTION = new Set(['index.html', '404.html']);
const DATA_FILES = '__tsr/staticServerFnCache';

/** `articles/c/web.html` read back as `/articles/c/web`. */
export function urlOfHtmlFile(file) {
  return `/${file.replace(/\.html$/, '')}`;
}

/** The comparison of the written pages and data files with the derivation. */
export function routeTableReport({
  htmlFiles,
  derivedUrls,
  articleCount,
  dataFileCount,
}) {
  const built = new Set(
    htmlFiles
      .filter((file) => !OUTSIDE_THE_CONTENT_SECTION.has(file))
      .map(urlOfHtmlFile),
  );
  const derived = new Set(derivedUrls);
  const builtButNotDerived = [...built].filter((url) => !derived.has(url));
  const derivedButNotBuilt = [...derived].filter((url) => !built.has(url));
  const expectedDataFiles = articleCount + 1;

  return {
    ok:
      builtButNotDerived.length === 0 &&
      derivedButNotBuilt.length === 0 &&
      dataFileCount === expectedDataFiles,
    built: built.size,
    builtButNotDerived,
    derivedButNotBuilt,
    expectedDataFiles,
    actualDataFiles: dataFileCount,
  };
}

async function filesUnder(directory, extension) {
  if (!existsSync(directory)) {
    return [];
  }
  const entries = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) =>
      relative(directory, join(entry.parentPath, entry.name))
        .split(sep)
        .join('/'),
    );
}

async function main() {
  const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const compiled = join(app, '.routing-dist');
  const client = join(app, 'dist/client');

  const { buildUrl } = await import('@robusta/pyramids-routing');
  const { urlScheme } = await import(join(compiled, 'routing/scheme.js'));
  const { contentUrls } = await import(
    join(compiled, 'routing/content-urls.js')
  );

  const pages = await contentUrls();
  const report = routeTableReport({
    htmlFiles: await filesUnder(client, '.html'),
    derivedUrls: pages.map((page) => buildUrl(urlScheme, page)),
    articleCount: pages.filter((page) => page.kind === 'article').length,
    dataFileCount: (await filesUnder(join(client, DATA_FILES), '.json')).length,
  });

  if (!report.ok) {
    console.error('The route table and the derived URL set disagree.');
    for (const url of report.builtButNotDerived) {
      console.error(`  built but not derived: ${url}`);
    }
    for (const url of report.derivedButNotBuilt) {
      console.error(`  derived but not built: ${url}`);
    }
    if (report.actualDataFiles !== report.expectedDataFiles) {
      console.error(
        `  data files: expected ${report.expectedDataFiles}, found ${report.actualDataFiles}`,
      );
    }
    process.exit(1);
  }

  console.log(
    `route table: ${report.built} content URLs built, and the derivation contains exactly those; ${report.actualDataFiles} data files written.`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await main();
}
