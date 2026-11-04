import { describe, expect, it } from 'vitest';
import { getArticleIndex, type ArticleIndexEntry } from './article-index.ts';
import { findArticle, findRelated, relatedAmong } from './article-lookup.ts';

/**
 * The lookup the four article routes converge on, held against the site's
 * own corpus rather than a fixture: what a route receives is a param shape the
 * index itself produced, so the pair that matters is the real one.
 */
describe('findArticle', () => {
  it('returns the article a locale and a slug name', async () => {
    const entry = await findArticle('en', 'leaving-gmail');

    expect(entry.path).toBe('privacy/leaving-gmail.md');
    expect(entry.title).toBe('Leaving Gmail');
    expect(entry.author).toBe('Nicolas Zozol');
  });

  it('reads the slug within its locale, and never across locales', async () => {
    await expect(findArticle('fr', 'leaving-gmail')).rejects.toThrow(
      /leaving-gmail/,
    );
  });

  /**
   * `dynamicParams = false` and `generateStaticParams` derive from this same
   * index, so a slug it does not carry cannot arrive through a request: the
   * failure is a build failure and never a not-found page (R-ARTICLEPAGE-06).
   */
  it('fails naming the locale and the slug when the index carries no such article', async () => {
    await expect(findArticle('en', 'never-written')).rejects.toThrow(
      /'en'[\s\S]*'never-written'|'never-written'[\s\S]*'en'/,
    );
  });
});

function fixture(
  slug: string,
  rest: Partial<ArticleIndexEntry> = {},
): ArticleIndexEntry {
  return {
    path: `${slug}.md`,
    slug,
    locale: 'en',
    title: `Title of ${slug}`,
    date: '2022-01-01',
    author: 'Nina',
    tags: [],
    excerpt: 'An excerpt.',
    ...rest,
  };
}

/**
 * R-SEOEXCELLENCE-81. Scenario of reference, an English index newest first:
 * - `subject`, Category web, tags css and react
 * - `same-category`, web, no shared tag, the oldest
 * - `two-tags`, no Category, css and react
 * - `one-tag`, no Category, css, newer than `two-tags`
 * - `newer-one-tag`, no Category, react, the newest
 * - `unrelated`, no Category, no shared tag
 * - `french`, web, css: another Locale
 * Expected: same Category first, then more shared tags, then newest.
 */
describe('relatedAmong', () => {
  const subject = fixture('subject', {
    category: 'web',
    tags: ['css', 'react'],
    date: '2022-06-01',
  });
  const index = [
    fixture('newer-one-tag', { tags: ['react'], date: '2023-01-01' }),
    fixture('french', {
      locale: 'fr',
      category: 'web',
      tags: ['css'],
      date: '2022-12-01',
    }),
    fixture('one-tag', { tags: ['css'], date: '2022-10-01' }),
    subject,
    fixture('two-tags', { tags: ['css', 'react'], date: '2022-03-01' }),
    fixture('unrelated', { tags: ['go'], date: '2022-02-01' }),
    fixture('same-category', { category: 'web', date: '2020-01-01' }),
  ];
  const slugs = (entries: readonly ArticleIndexEntry[]) =>
    entries.map((entry) => entry.slug);

  it('orders the Category first, then more shared tags, then the newest, itself and another Locale excluded', () => {
    expect(slugs(relatedAmong(subject, index, 10))).toEqual([
      'same-category',
      'two-tags',
      'newer-one-tag',
      'one-tag',
    ]);
  });

  it('keeps `limit` at most', () => {
    expect(slugs(relatedAmong(subject, index, 3))).toEqual([
      'same-category',
      'two-tags',
      'newer-one-tag',
    ]);
  });

  it('is empty for an article sharing neither Category nor tag with any other', () => {
    expect(relatedAmong(index[5], index, 3)).toEqual([]);
  });
});

describe('findRelated', () => {
  it('finds the related articles of the corpus in the article’s Locale, three at most', async () => {
    const french = await findArticle('fr', 'quitter-gmail');
    const related = await findRelated(french, 3);

    expect(related.length).toBeLessThanOrEqual(3);
    expect(related.length).toBeGreaterThan(0);
    for (const entry of related) {
      expect(entry.locale).toBe('fr');
      expect(entry.slug).not.toBe('quitter-gmail');
    }
  });

  it('gives no French article an English related article', async () => {
    const index = await getArticleIndex();
    for (const entry of index.filter((article) => article.locale === 'fr')) {
      for (const related of await findRelated(entry, 3)) {
        expect(related.locale).toBe('fr');
      }
    }
  });
});
