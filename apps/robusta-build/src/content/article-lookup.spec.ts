import { describe, expect, it } from 'vitest';
import { findArticle } from './article-lookup.js';

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
