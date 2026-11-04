/**
 * The audit of AC-SEOEXCELLENCE-6 on the pages the prerender wrote under
 * `dist/client` and the sitemap beside them: one line per defect, naming the
 * page, and exit 1 on any. Reads the markup by tag patterns, as
 * `check-route-table.mjs` does. Runs after `emit-site-files.mjs`.
 *
 * Design: features/pyramid-v2-epic/seo-excellence/seo-excellence.design.md
 * Requirements: R-SEOEXCELLENCE-141, R-SEOEXCELLENCE-142, R-SEOEXCELLENCE-143
 */
import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { urlOfHtmlFile } from './check-route-table.mjs';

const X_DEFAULT = 'x-default';

/** The defects of a build, each `{page}: {defect}`, the count of pages checked and of indexable ones, and the summary line. */
export function seoReport({
  pages,
  sitemap,
  files,
  robotsOf,
  indexingOpen,
  origin,
}) {
  const read = pages.map(({ file, html }) =>
    readPage(urlOfHtmlFile(file), html),
  );
  const built = new Map(read.map((page) => [page.url, page]));
  const fileSet = new Set(files);
  const sitemapLocs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map(
    ([, loc]) => unescapeXml(loc),
  );
  const inSitemap = new Set(sitemapLocs);
  const pathOf = (href) =>
    href.startsWith(origin) ? href.slice(origin.length) || '/' : undefined;

  const defects = [
    ...sharedTextDefects(read, 'title'),
    ...sharedTextDefects(read, 'description'),
    ...read.flatMap((page) => [
      ...canonicalDefects(page, inSitemap, pathOf),
      ...linkDefects(page, built, fileSet),
      ...alternateDefects(page, built, pathOf),
      ...(page.h1Count === 1
        ? []
        : [`${page.url}: ${page.h1Count} h1 headings, one expected`]),
      ...robotsDefects(page, robotsOf),
    ]),
    ...sitemapLocs
      .filter((loc) => !read.some((page) => page.canonical === loc))
      .map(
        (loc) =>
          `${loc}: in the sitemap, but no built page declares it canonical`,
      ),
  ];
  const indexable = read.filter((page) => page.canonical !== undefined).length;

  return {
    defects,
    checked: read.length,
    indexable,
    summary: `seo: ${read.length} pages checked, ${indexable} indexable and all in the sitemap; indexing ${indexingOpen ? 'open' : 'closed'}`,
  };
}

function readPage(url, html) {
  const headEnd = html.indexOf('</head>');
  const head = headEnd === -1 ? html : html.slice(0, headEnd);
  const metas = tagsOf(head, 'meta');
  const links = tagsOf(head, 'link');
  const metaNamed = (name) =>
    metas.find((attrs) => attrs.name === name)?.content;
  const title = /<title>([^<]*)<\/title>/.exec(head)?.[1];

  return {
    url,
    lang: /<html\b[^>]*\slang="([^"]*)"/.exec(html)?.[1],
    title: nonEmpty(title),
    description: nonEmpty(metaNamed('description')),
    robots: metaNamed('robots'),
    canonical: links.find((attrs) => attrs.rel === 'canonical')?.href,
    alternates: links
      .filter(
        (attrs) => attrs.rel === 'alternate' && attrs.hreflang !== undefined,
      )
      .map((attrs) => ({ lang: attrs.hreflang, href: attrs.href })),
    hrefs: [
      ...tagsOf(html, 'a').map((attrs) => attrs.href),
      ...links.map((attrs) => attrs.href),
    ].filter((href) => href !== undefined),
    h1Count: [...html.matchAll(/<h1[\s>]/g)].length,
  };
}

/** Each opening tag of `name`, its attributes keyed in lowercase, values unescaped. */
function tagsOf(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, 'g'))].map(([tag]) =>
    Object.fromEntries(
      [...tag.matchAll(/\s([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [
        key.toLowerCase(),
        unescapeHtml(value),
      ]),
    ),
  );
}

function sharedTextDefects(pages, field) {
  return pages.flatMap((page, index) => {
    if (page[field] === undefined) {
      return [`${page.url}: no ${field}`];
    }
    const first = pages.find(
      (other) => other.lang === page.lang && other[field] === page[field],
    );
    return pages.indexOf(first) < index
      ? [`${page.url}: ${field} shared with ${first.url}`]
      : [];
  });
}

function canonicalDefects(page, inSitemap, pathOf) {
  if (page.canonical === undefined) {
    return [];
  }
  return [
    ...(inSitemap.has(page.canonical)
      ? []
      : [`${page.url}: canonical URL ${page.canonical} is not in the sitemap`]),
    ...(pathOf(page.canonical) === page.url
      ? []
      : [`${page.url}: canonical URL ${page.canonical} names another page`]),
  ];
}

function linkDefects(page, built, files) {
  return page.hrefs
    .filter((href) => href.startsWith('/') && !href.startsWith('//'))
    .map((href) => href.replace(/[?#].*$/, '') || '/')
    .filter((path) => !built.has(path) && !files.has(path.slice(1)))
    .map(
      (path) => `${page.url}: link to ${path} leads to no built page or file`,
    );
}

function alternateDefects(page, built, pathOf) {
  return page.alternates.flatMap(({ lang, href }) => {
    const target = built.get(pathOf(href));
    if (target === undefined) {
      return [`${page.url}: alternate ${lang} ${href} leads to no built page`];
    }
    const linksBack = target.alternates.some(
      (alternate) =>
        alternate.lang !== X_DEFAULT && pathOf(alternate.href) === page.url,
    );
    return lang === X_DEFAULT || linksBack
      ? []
      : [`${page.url}: alternate ${lang} ${href} does not link back`];
  });
}

function robotsDefects(page, robotsOf) {
  const expected = robotsOf(page.canonical !== undefined);
  return page.robots === expected
    ? []
    : [`${page.url}: robots '${page.robots}', expected '${expected}'`];
}

function nonEmpty(text) {
  return text === undefined || text.trim() === '' ? undefined : text;
}

function unescapeHtml(text) {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function unescapeXml(text) {
  return unescapeHtml(text.replace(/&apos;/g, "'"));
}

async function filesUnder(directory) {
  if (!existsSync(directory)) {
    return [];
  }
  const entries = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  });
  return entries
    .filter((entry) => entry.isFile())
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

  const { INDEXING_OPEN, robotsOf } = await import(
    join(compiled, 'seo/index.js')
  );
  const { SITE_ORIGIN } = await import(join(compiled, 'routing/scheme.js'));

  const files = await filesUnder(client);
  const pages = await Promise.all(
    files
      .filter((file) => file.endsWith('.html'))
      .map(async (file) => ({
        file,
        html: await readFile(join(client, file), 'utf8'),
      })),
  );
  const report = seoReport({
    pages,
    sitemap: await readFile(join(client, 'sitemap.xml'), 'utf8'),
    files,
    robotsOf: (indexable) => robotsOf(indexable),
    indexingOpen: INDEXING_OPEN,
    origin: SITE_ORIGIN,
  });

  if (report.defects.length > 0) {
    for (const defect of report.defects) {
      console.error(defect);
    }
    process.exit(1);
  }
  console.log(report.summary);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await main();
}
