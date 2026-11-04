/**
 * Writes `dist/client/sitemap.xml` and `dist/client/robots.txt`, after
 * `vite build`, which empties that directory. Runs on what `compile:seams`
 * wrote under `.routing-dist`; a corpus or scheme violation, thrown by
 * `contentUrls`, fails it.
 *
 * Design: features/pyramid-v2-epic/seo-excellence/seo-excellence.design.md
 * Requirements: R-SEOEXCELLENCE-41, R-SEOEXCELLENCE-42, R-SEOEXCELLENCE-43
 */
import { writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const LISTING_KINDS = ['blog-home', 'category'];

/** The sitemap of the indexable pages, landing pages then content URLs, robots.txt, and the summary line counting the pages by kind. */
export function siteFiles({ landings, content, articles, seo }) {
  const pages = [...landings, ...content];
  const indexable = pages.filter((page) => seo.isIndexable(page, articles));
  const count = (kinds) =>
    indexable.filter((page) => kinds.includes(page.kind)).length;

  return {
    sitemap: seo.sitemapXml(seo.sitemapEntries(pages, articles)),
    robots: seo.robotsTxt(),
    summary: `site files: sitemap.xml lists ${indexable.length} indexable pages (${count(['landing'])} landing pages, ${count(LISTING_KINDS)} listing pages, ${count(['article'])} articles), robots.txt names it`,
  };
}

async function main() {
  const app = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const compiled = join(app, '.routing-dist');
  const client = join(app, 'dist/client');

  const { landingPages } = await import(
    join(compiled, 'routing/url-scheme/index.js')
  );
  const { urlScheme } = await import(join(compiled, 'routing/scheme.js'));
  const { contentUrls } = await import(
    join(compiled, 'routing/content-urls.js')
  );
  const { getArticleIndex } = await import(
    join(compiled, 'content/article-index.js')
  );
  const seo = await import(join(compiled, 'seo/index.js'));

  const { sitemap, robots, summary } = siteFiles({
    landings: landingPages(urlScheme),
    content: await contentUrls(),
    articles: await getArticleIndex(),
    seo,
  });
  await writeFile(join(client, 'sitemap.xml'), sitemap, 'utf8');
  await writeFile(join(client, 'robots.txt'), robots, 'utf8');
  console.log(summary);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  await main();
}
