import { describe, expect, it } from 'vitest';
import { articlePage } from './article-page.ts';

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
    expect(french.categoryUrl).toBe('/fr/articles/c/blockchain');
  });

  it('writes the date as the article’s locale writes it, at build', async () => {
    const english = await articlePage({ locale: 'en', slug: YIELD_EN });
    const french = await articlePage({ locale: 'fr', slug: YIELD_FR });

    expect(english.writtenDate).toBe('November 30, 2021');
    expect(french.writtenDate).toBe('30 novembre 2021');
  });

  it('lists the other published version of a translated article, both ways', async () => {
    const english = await articlePage({ locale: 'en', slug: YIELD_EN });
    const french = await articlePage({ locale: 'fr', slug: YIELD_FR });

    expect(english.versions).toEqual([
      { locale: 'fr', url: `/fr/articles/c/blockchain/${YIELD_FR}` },
    ]);
    expect(french.versions).toEqual([
      { locale: 'en', url: `/articles/c/blockchain/${YIELD_EN}` },
    ]);
  });

  it('ties leaving-gmail and quitter-gmail to each other', async () => {
    const english = await articlePage({ locale: 'en', slug: 'leaving-gmail' });
    const french = await articlePage({ locale: 'fr', slug: 'quitter-gmail' });

    expect(english.versions).toEqual([
      { locale: 'fr', url: '/fr/articles/c/privacy/quitter-gmail' },
    ]);
    expect(french.versions).toEqual([
      { locale: 'en', url: '/articles/c/privacy/leaving-gmail' },
    ]);
  });

  it('lists no version for an article with no published pair', async () => {
    const page = await articlePage({
      locale: 'fr',
      slug: 'quel-langage-pour-progresser-dans-sa-carriere',
    });

    expect(page.versions).toEqual([]);
    expect(page).not.toHaveProperty('translation');
  });

  it('rejects naming the locale and the slug when no article matches', async () => {
    await expect(
      articlePage({ locale: 'en', slug: 'never-written' }),
    ).rejects.toThrow(/'en'.*'never-written'/);
  });
});
