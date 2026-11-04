/**
 * The built route table and the pages the scheme derives are the same set: the
 * landing page of every Locale, `/` read from `index.html`, and every content
 * URL, and every data file the prerender owes, the counterparts of every page
 * carrying a page URL, each listing page and the footer's rolls of each Locale
 * included.
 * No page was written around a render that threw. Run after `vite build`, on
 * what the prerender wrote under `dist/client`.
 *
 * Design: features/pyramid-v2-epic/__done/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-26
 * Design: features/pyramid-v2-epic/multilingual-site/multilingual-site.design.md
 * Requirements: R-MULTILINGUAL-04, R-MULTILINGUAL-27, R-MULTILINGUAL-43
 * Design: features/pyramid-v2-epic/default-locale-at-root/default-locale-at-root.design.md
 * Requirements: R-ROOTLOCALE-25
 * Design: features/pyramid-v2-epic/blog-rolls/blog-rolls.design.md
 * Requirements: R-BLOGROLLS-81
 */
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const NOT_FOUND = '404.html';
const DATA_FILES = '__tsr/staticServerFnCache';
// React's marker of a Suspense boundary whose server render threw: the prerender
// logs the error, answers 200 and leaves that content to the browser.
const CLIENT_RENDERED_BOUNDARY = '<!--$!-->';

/** `fr/articles/c/web.html` read back as `/fr/articles/c/web`, `index.html` as `/`. */
export function urlOfHtmlFile(file) {
  return file === 'index.html' ? '/' : `/${file.replace(/\.html$/, '')}`;
}

/** The data files the prerender owes, per source: each article page, each landing page's notes feed, the counterparts of each page carrying a page URL, each listing page, and the footer's rolls of each Locale. */
export function expectedDataFiles({ landings, content }) {
  return {
    articles: content.filter((page) => page.kind === 'article').length,
    notesFeeds: landings.length,
    counterparts: landings.length + content.length,
    rollPages: content.filter(
      (page) => page.kind === 'blog-home' || page.kind === 'category',
    ).length,
    localeRolls: landings.length,
  };
}

/** The comparison of the written pages and data files with the derivation; `expectedDataFiles` counts each source of data files. */
export function routeTableReport({
  htmlFiles,
  landingUrls,
  contentUrls,
  expectedDataFiles,
  dataFileCount,
}) {
  const built = new Set(
    htmlFiles.filter((file) => file !== NOT_FOUND).map(urlOfHtmlFile),
  );
  const derived = new Set([...landingUrls, ...contentUrls]);
  const builtButNotDerived = [...built].filter((url) => !derived.has(url));
  const derivedButNotBuilt = [...derived].filter((url) => !built.has(url));
  const expected = Object.values(expectedDataFiles).reduce(
    (sum, count) => sum + count,
    0,
  );

  return {
    ok:
      builtButNotDerived.length === 0 &&
      derivedButNotBuilt.length === 0 &&
      dataFileCount === expected,
    built: built.size,
    builtButNotDerived,
    derivedButNotBuilt,
    expectedDataFiles: expected,
    actualDataFiles: dataFileCount,
  };
}

/** The URLs of the pages whose render threw at prerender, each `{ file, html }` as written under `dist/client`. */
export function pagesRenderedWithAnError(pages) {
  return pages
    .filter(({ html }) => html.includes(CLIENT_RENDERED_BOUNDARY))
    .map(({ file }) => urlOfHtmlFile(file));
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

  const { buildUrl, landingPages } = await import(
    join(compiled, 'routing/url-scheme/index.js')
  );
  const { urlScheme } = await import(join(compiled, 'routing/scheme.js'));
  const { contentUrls } = await import(
    join(compiled, 'routing/content-urls.js')
  );

  const landings = landingPages(urlScheme);
  const content = await contentUrls();
  const htmlFiles = await filesUnder(client, '.html');
  const failedRenders = pagesRenderedWithAnError(
    await Promise.all(
      htmlFiles.map(async (file) => ({
        file,
        html: await readFile(join(client, file), 'utf8'),
      })),
    ),
  );
  if (failedRenders.length > 0) {
    console.error(
      'Pages written around a render that threw: the prerender logged each error above, "Error in renderToPipeableStream".',
    );
    for (const url of failedRenders) {
      console.error(`  ${url}`);
    }
    process.exit(1);
  }

  const owed = expectedDataFiles({ landings, content });
  const report = routeTableReport({
    htmlFiles,
    landingUrls: landings.map((page) => buildUrl(urlScheme, page)),
    contentUrls: content.map((page) => buildUrl(urlScheme, page)),
    expectedDataFiles: owed,
    dataFileCount: (await filesUnder(join(client, DATA_FILES), '.json')).length,
  });
  const owedLine = `${owed.articles} article pages, ${owed.notesFeeds} notes feeds, ${owed.counterparts} counterparts, ${owed.rollPages} roll pages, ${owed.localeRolls} locale rolls`;

  if (!report.ok) {
    console.error('The route table and the derived pages disagree.');
    for (const url of report.builtButNotDerived) {
      console.error(`  built but not derived: ${url}`);
    }
    for (const url of report.derivedButNotBuilt) {
      console.error(`  derived but not built: ${url}`);
    }
    if (report.actualDataFiles !== report.expectedDataFiles) {
      console.error(
        `  data files: expected ${report.expectedDataFiles} (${owedLine}), found ${report.actualDataFiles}`,
      );
    }
    process.exit(1);
  }

  console.log(
    `route table: ${report.built} pages built (${landings.length} landing pages, ${content.length} content URLs), and the derivation contains exactly those; ${report.actualDataFiles} data files written (${owedLine}).`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await main();
}
