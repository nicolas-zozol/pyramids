import { describe, expect, it, vi } from 'vitest';
import type { ArticleIndexEntry } from '../content/article-index.ts';
import { articlePage } from './article-page.ts';

/** No article of the corpus declares `updated` yet: the lookup hands back a real one, revised. */
vi.mock('../content/article-lookup.ts', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('../content/article-lookup.ts')>();
  return {
    ...original,
    findArticle: async (
      locale: string,
      slug: string,
    ): Promise<ArticleIndexEntry> => ({
      ...(await original.findArticle(locale, slug)),
      updated: '2024-02-01',
    }),
  };
});

// R-SEOEXCELLENCE-65.
describe('articlePage of an article declaring an update date', () => {
  it('writes the update date as the article’s Locale writes it, in UTC', async () => {
    const english = await articlePage({ locale: 'en', slug: 'leaving-gmail' });
    const french = await articlePage({ locale: 'fr', slug: 'quitter-gmail' });

    expect(english.writtenUpdated).toBe('February 1, 2024');
    expect(french.writtenUpdated).toBe('1 février 2024');
  });
});
