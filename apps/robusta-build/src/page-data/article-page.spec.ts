import { describe, expect, it } from 'vitest';
import { articlePage } from './article-page.js';

const YIELD_EN = 'the-source-of-yield-farming-profits';
const YIELD_FR =
  'provenance-des-rendements-du-yield-farming-dans-la-blockchain';

/**
 * Everything one article page renders, computed at build from the site's own
 * corpus: the yield-farming pair is the one translated article whose two sides
 * share a category.
 */
describe('articlePage', () => {
  it('carries the entry and the body of the article a locale and a slug name', async () => {
    const page = await articlePage({ locale: 'en', slug: YIELD_EN });

    expect(page.article.title).toBe('The source of Yield Farming profits');
    expect(page.article.author).toBe('Nicolas Zozol');
    expect(page.html).toContain('<p>');
  });

  it('resolves the cover under the asset root', async () => {
    const page = await articlePage({ locale: 'en', slug: YIELD_EN });

    expect(page.coverUrl).toBe(
      '/article-images/blockchain/images/aave-small.png',
    );
  });

  it('builds the category URL in the article’s own locale', async () => {
    const english = await articlePage({ locale: 'en', slug: YIELD_EN });
    const french = await articlePage({ locale: 'fr', slug: YIELD_FR });

    expect(english.categoryUrl).toBe('/articles/c/blockchain');
    expect(french.categoryUrl).toBe('/l/fr/articles/c/blockchain');
  });

  it('writes the date as the article’s locale writes it, at build', async () => {
    const english = await articlePage({ locale: 'en', slug: YIELD_EN });
    const french = await articlePage({ locale: 'fr', slug: YIELD_FR });

    expect(english.writtenDate).toBe('November 30, 2021');
    expect(french.writtenDate).toBe('30 novembre 2021');
  });

  it('links the other locale with the language naming itself, both ways', async () => {
    const english = await articlePage({ locale: 'en', slug: YIELD_EN });
    const french = await articlePage({ locale: 'fr', slug: YIELD_FR });

    expect(english.translation).toEqual({
      url: `/l/fr/articles/c/blockchain/${YIELD_FR}`,
      locale: 'fr',
      label: 'français',
    });
    expect(french.translation).toEqual({
      url: `/articles/c/blockchain/${YIELD_EN}`,
      locale: 'en',
      label: 'English',
    });
  });

  it('carries no translation key for an article with no published pair', async () => {
    const page = await articlePage({ locale: 'en', slug: 'leaving-gmail' });

    expect(page).not.toHaveProperty('translation');
  });

  it('rejects naming the locale and the slug when no article matches', async () => {
    await expect(
      articlePage({ locale: 'en', slug: 'never-written' }),
    ).rejects.toThrow(/'en'.*'never-written'/);
  });
});
