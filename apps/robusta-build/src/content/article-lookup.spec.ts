import { describe, expect, it } from 'vitest';
import { findArticle, findTranslation } from './article-lookup.js';

/**
 * The two lookups the four article routes converge on, held against the site's
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

describe('findTranslation', () => {
  it('returns the other locale of a translated article', async () => {
    const english = await findArticle(
      'en',
      'the-source-of-yield-farming-profits',
    );

    const french = await findTranslation(english);

    expect(french?.locale).toBe('fr');
    expect(french?.slug).toBe(
      'provenance-des-rendements-du-yield-farming-dans-la-blockchain',
    );
  });

  it('pairs both ways, so either side of a pair links to the other', async () => {
    const french = await findArticle(
      'fr',
      'provenance-des-rendements-du-yield-farming-dans-la-blockchain',
    );

    const english = await findTranslation(french);

    expect(english?.slug).toBe('the-source-of-yield-farming-profits');
  });

  /** R-ARTICLEPAGE-43: seven of the eleven articles have no pair, and no dead link is what renders. */
  it('returns nothing for an article declaring no translation identifier', async () => {
    const alone = await findArticle(
      'fr',
      'quel-langage-pour-progresser-dans-sa-carriere',
    );

    expect(alone.translationId).toBeUndefined();
    expect(await findTranslation(alone)).toBeUndefined();
  });
});
