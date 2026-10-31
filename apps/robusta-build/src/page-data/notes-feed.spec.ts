import { describe, expect, it } from 'vitest';
import { notesFeed } from './notes-feed.ts';

/**
 * The notes section's posts, selected from the site's own corpus: the index is
 * newest first, so the feed is its head within one locale.
 */
describe('notesFeed', () => {
  it('returns the newest articles of one locale, at most the limit asked', async () => {
    const english = await notesFeed({ locale: 'en', limit: 4 });
    const french = await notesFeed({ locale: 'fr', limit: 4 });

    expect(english).toHaveLength(4);
    expect(french).toHaveLength(4);
  });

  it('points each post at its canonical article URL, tagged with its category', async () => {
    const french = await notesFeed({ locale: 'fr', limit: 4 });
    const yieldFarming = french.find((post) =>
      post.title.startsWith('Provenance des rendements'),
    );

    expect(yieldFarming).toEqual({
      title: 'Provenance des rendements du Yield Farming dans la blockchain',
      href: '/fr/articles/c/blockchain/provenance-des-rendements-du-yield-farming-dans-la-blockchain',
      tag: 'blockchain',
      date: '30 nov.',
    });
  });

  it('feeds the French landing page, four places wide, the four newest French articles under /fr', async () => {
    const landing = await notesFeed({ locale: 'fr', limit: 4 });

    expect(landing.map((post) => post.href)).toEqual([
      '/fr/articles/c/blockchain/ledger-contre-metamask',
      '/fr/articles/c/blockchain/les-bons-outils-pour-coder-en-solidity',
      '/fr/articles/c/blockchain/provenance-des-rendements-du-yield-farming-dans-la-blockchain',
      '/fr/articles/c/javascript/pourquoi-jai-migre-de-gatsby-vers-nextjs',
    ]);
  });

  it('feeds the Spanish landing page nothing while no Spanish article is published', async () => {
    expect(await notesFeed({ locale: 'es', limit: 4 })).toEqual([]);
  });

  it('writes a note’s date as the feed’s Locale writes it, from the calendar date', async () => {
    const french = await notesFeed({ locale: 'fr', limit: 11 });
    const english = await notesFeed({ locale: 'en', limit: 11 });
    const dateOf = (posts: typeof french, href: string) =>
      posts.find((post) => post.href?.endsWith(href))?.date;

    expect(dateOf(french, '/les-bons-outils-pour-coder-en-solidity')).toBe(
      '13 déc.',
    );
    expect(dateOf(english, '/ledger-versus-metamask')).toBe('Jan 20');
  });

  it('takes the head of the locale’s articles, so a smaller limit is a prefix of a larger one', async () => {
    const head = await notesFeed({ locale: 'en', limit: 4 });
    const all = await notesFeed({ locale: 'en', limit: 11 });

    expect(all).toHaveLength(8);
    expect(head).toEqual(all.slice(0, 4));
  });
});
