import { describe, expect, it } from 'vitest';
import type { ArticleIndexEntry } from '../content/article-index.ts';
import { articlesListedBy } from './listed-articles.ts';

/** `count` articles of one Locale and Category, newest first as the index gives them. */
function articles(
  count: number,
  locale = 'en',
  category = 'web',
): ArticleIndexEntry[] {
  return Array.from({ length: count }, (_, i) => ({
    path: `${category}/${locale}-${i + 1}.md`,
    slug: `${category}-${locale}-${i + 1}`,
    locale,
    category,
    title: `Article ${i + 1}`,
    date: `2022-${String(12 - (i % 12)).padStart(2, '0')}-01`,
    author: 'Nina',
    tags: [],
    excerpt: 'An excerpt.',
  }));
}

const titles = (entries: readonly ArticleIndexEntry[]) =>
  entries.map((entry) => entry.title);

// R-SEOEXCELLENCE-42: the articles a page lists, which date it in the sitemap.
describe('articlesListedBy', () => {
  const index = [...articles(14), ...articles(2, 'fr', 'theory')];

  it('is the four newest articles of its Locale on a landing page', () => {
    expect(
      titles(articlesListedBy({ kind: 'landing', locale: 'en' }, index)),
    ).toEqual(['Article 1', 'Article 2', 'Article 3', 'Article 4']);
    expect(articlesListedBy({ kind: 'landing', locale: 'es' }, index)).toEqual(
      [],
    );
  });

  it('is the slice of a roll page, page two included', () => {
    expect(
      articlesListedBy({ kind: 'blog-home', locale: 'en', page: 1 }, index),
    ).toHaveLength(12);
    expect(
      titles(
        articlesListedBy(
          { kind: 'category', locale: 'en', category: 'web', page: 2 },
          index,
        ),
      ),
    ).toEqual(['Article 13', 'Article 14']);
    expect(
      titles(
        articlesListedBy(
          { kind: 'category', locale: 'fr', category: 'theory', page: 1 },
          index,
        ),
      ),
    ).toEqual(['Article 1', 'Article 2']);
  });

  it('is nothing on an empty blog home, a page beyond the last, an article or a tag page', () => {
    expect(
      articlesListedBy({ kind: 'blog-home', locale: 'es', page: 1 }, index),
    ).toEqual([]);
    expect(
      articlesListedBy({ kind: 'blog-home', locale: 'en', page: 3 }, index),
    ).toEqual([]);
    expect(
      articlesListedBy(
        { kind: 'article', locale: 'en', category: 'web', slug: 'web-en-1' },
        index,
      ),
    ).toEqual([]);
    expect(
      articlesListedBy(
        { kind: 'tag', locale: 'en', tag: 'css', page: 1 },
        index,
      ),
    ).toEqual([]);
  });
});
