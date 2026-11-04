import { describe, expect, it } from 'vitest';
import {
  getArticleIndex,
  type ArticleIndexEntry,
} from '../content/article-index.ts';
import { contentUrls } from '../routing/content-urls.ts';
import { urlScheme } from '../routing/scheme.ts';
import {
  landingPages,
  urlSet,
  type PageUrl,
} from '../routing/url-scheme/index.ts';
import { robotsTxt, sitemapEntries, sitemapXml } from './index.ts';

const ORIGIN = 'https://www.robusta.build';

function article(
  slug: string,
  locale: string,
  date: string,
  rest: Partial<ArticleIndexEntry> = {},
): ArticleIndexEntry {
  return {
    path: `${slug}.md`,
    slug,
    locale,
    category: 'web',
    title: slug,
    date,
    author: 'Nina',
    tags: [],
    excerpt: 'An excerpt.',
    ...rest,
  };
}

/** The pages the build walks for a corpus: landing pages then content URLs. */
const pagesOf = (articles: readonly ArticleIndexEntry[]): PageUrl[] => [
  ...landingPages(urlScheme),
  ...urlSet(urlScheme, articles),
];

const lastmodOf = (
  entries: { loc: string; lastmod?: string }[],
  path: string,
) => entries.find((entry) => entry.loc === `${ORIGIN}${path}`)?.lastmod;

// R-SEOEXCELLENCE-41 and 42, AC-SEOEXCELLENCE-3.
describe('sitemapEntries on the corpus of the site', () => {
  it('lists the 33 indexable pages, the 3 landing pages first, then the 13 listing pages and the 17 articles', async () => {
    const articles = await getArticleIndex();
    const entries = sitemapEntries(
      [...landingPages(urlScheme), ...(await contentUrls())],
      articles,
    );

    expect(entries).toHaveLength(33);
    expect(entries.slice(0, 3).map((entry) => entry.loc)).toEqual([
      `${ORIGIN}/`,
      `${ORIGIN}/fr`,
      `${ORIGIN}/es`,
    ]);
    for (const { loc } of entries) {
      expect(loc.startsWith(`${ORIGIN}/`)).toBe(true);
      const { pathname } = new URL(loc);
      expect(pathname).not.toMatch(/\.html$|^\/en(\/|$)/);
      expect(pathname === '/' || !pathname.endsWith('/')).toBe(true);
    }
  });

  it('dates a landing page by the newest of its four notes, and lists /es without a date', async () => {
    const articles = await getArticleIndex();
    const entries = sitemapEntries(
      [...landingPages(urlScheme), ...(await contentUrls())],
      articles,
    );

    expect(lastmodOf(entries, '/')).toBe('2022-01-20');
    expect(lastmodOf(entries, '/fr')).toBe('2022-01-20');
    expect(entries.find((entry) => entry.loc === `${ORIGIN}/es`)).toEqual({
      loc: `${ORIGIN}/es`,
    });
    expect(lastmodOf(entries, '/articles/c/privacy/leaving-gmail')).toBe(
      '2019-05-24',
    );
    expect(lastmodOf(entries, '/articles/c/privacy')).toBe('2019-05-24');
  });
});

describe('sitemapEntries on a fixture corpus', () => {
  it('dates an article by its update date when it declares one, by its publication date otherwise', () => {
    const articles = [
      article('revised', 'en', '2021-01-01', { updated: '2024-02-01' }),
      article('untouched', 'en', '2020-01-01'),
    ];
    const entries = sitemapEntries(pagesOf(articles), articles);

    expect(lastmodOf(entries, '/articles/c/web/revised')).toBe('2024-02-01');
    expect(lastmodOf(entries, '/articles/c/web/untouched')).toBe('2020-01-01');
    expect(lastmodOf(entries, '/articles/c/web')).toBe('2024-02-01');
  });

  it('keeps the date of the four listed notes on a landing page whose older article was revised later', () => {
    const notes = ['a', 'b', 'c', 'd'].map((slug, i) =>
      article(slug, 'en', `2022-0${5 - i}-01`),
    );
    const older = article('older', 'en', '2020-01-01', {
      updated: '2025-06-01',
    });
    const articles = [...notes, older];

    expect(lastmodOf(sitemapEntries(pagesOf(articles), articles), '/')).toBe(
      '2022-05-01',
    );
  });

  it('omits an empty en blog home and every page of an unpublished article, the index holding published articles only', () => {
    const articles = [article('seul', 'fr', '2022-01-01')];
    const locs = sitemapEntries(pagesOf(articles), articles).map(
      (entry) => entry.loc,
    );

    expect(locs).not.toContain(`${ORIGIN}/articles`);
    expect(locs).toContain(`${ORIGIN}/fr/articles`);
    expect(locs).toContain(`${ORIGIN}/fr/articles/c/web/seul`);
    expect(locs).toHaveLength(3 + 3);
  });

  it('lists no tag page', () => {
    const entries = sitemapEntries(
      [{ kind: 'tag', locale: 'en', tag: 'css', page: 1 }],
      [],
    );

    expect(entries).toEqual([]);
  });
});

describe('sitemapXml', () => {
  it('writes a urlset of the sitemap protocol 0.9, one url per entry, the date only when the entry has one', () => {
    expect(
      sitemapXml([
        { loc: `${ORIGIN}/`, lastmod: '2022-01-20' },
        { loc: `${ORIGIN}/es` },
      ]),
    ).toBe(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url>',
        `    <loc>${ORIGIN}/</loc>`,
        '    <lastmod>2022-01-20</lastmod>',
        '  </url>',
        '  <url>',
        `    <loc>${ORIGIN}/es</loc>`,
        '  </url>',
        '</urlset>',
        '',
      ].join('\n'),
    );
  });

  it('escapes the characters XML reserves', () => {
    expect(sitemapXml([{ loc: `${ORIGIN}/a&b` }])).toContain(
      `<loc>${ORIGIN}/a&amp;b</loc>`,
    );
  });
});

// R-SEOEXCELLENCE-43.
describe('robotsTxt', () => {
  it('allows everything and names the sitemap', () => {
    expect(robotsTxt()).toBe(
      `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`,
    );
    expect(robotsTxt()).not.toContain('Disallow');
  });
});
