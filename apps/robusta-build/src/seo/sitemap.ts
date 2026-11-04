import type { ArticleIndexEntry } from '../content/article-index.ts';
import { articlesListedBy } from '../routing/listed-articles.ts';
import { urlScheme } from '../routing/scheme.ts';
import { buildUrl, type PageUrl } from '../routing/url-scheme/index.ts';
import type { SitemapEntry } from './declaration.ts';
import { isIndexable } from './indexing.ts';
import { absoluteUrl } from './page-head.ts';

/** The indexable pages of `urls`, in their order, landing pages then content URLs, each dated when it lists a dated article. */
export function sitemapEntries(
  urls: readonly PageUrl[],
  articles: readonly ArticleIndexEntry[],
): SitemapEntry[] {
  return urls
    .filter((page) => isIndexable(page, articles))
    .map((page) => {
      const lastmod = lastmodOf(page, articles);
      return {
        loc: absoluteUrl(buildUrl(urlScheme, page)),
        ...(lastmod === undefined ? {} : { lastmod }),
      };
    });
}

function lastmodOf(
  page: PageUrl,
  articles: readonly ArticleIndexEntry[],
): string | undefined {
  const dated =
    page.kind === 'article'
      ? articles.filter(
          (article) =>
            article.locale === page.locale && article.slug === page.slug,
        )
      : articlesListedBy(page, articles);
  const dates = dated.map((article) => article.updated ?? article.date);
  return dates.length === 0
    ? undefined
    : dates.reduce((a, b) => (a > b ? a : b));
}

/** A urlset of the sitemap protocol 0.9, one url per entry. */
export function sitemapXml(entries: SitemapEntry[]): string {
  const urls = entries.flatMap(({ loc, lastmod }) => [
    '  <url>',
    `    <loc>${xmlText(loc)}</loc>`,
    ...(lastmod === undefined ? [] : [`    <lastmod>${lastmod}</lastmod>`]),
    '  </url>',
  ]);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    '</urlset>',
    '',
  ].join('\n');
}

/** Allows everything and names the sitemap. */
export function robotsTxt(): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`;
}

function xmlText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
