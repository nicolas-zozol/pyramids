import { describe, expect, it } from 'vitest';
import { notesFeed } from './notes-feed.js';

/**
 * The notes section's posts, selected from the site's own corpus: the index is
 * newest first, so the feed is its head within one locale.
 */
describe('notesFeed', () => {
  it('returns the newest articles of one locale, at most the limit asked', async () => {
    const english = await notesFeed({ locale: 'en', limit: 4 });
    const french = await notesFeed({ locale: 'fr', limit: 4 });

    expect(english).toHaveLength(4);
    expect(french).toHaveLength(3);
  });

  it('points each post at its canonical article URL, tagged with its category', async () => {
    const french = await notesFeed({ locale: 'fr', limit: 4 });
    const yieldFarming = french.find((post) =>
      post.title.startsWith('Provenance des rendements'),
    );

    expect(yieldFarming).toEqual({
      title: 'Provenance des rendements du Yield Farming dans la blockchain',
      href: '/l/fr/articles/c/blockchain/provenance-des-rendements-du-yield-farming-dans-la-blockchain',
      tag: 'blockchain',
      date: 'nov 30',
    });
  });

  it('takes the head of the locale’s articles, so a smaller limit is a prefix of a larger one', async () => {
    const head = await notesFeed({ locale: 'en', limit: 4 });
    const all = await notesFeed({ locale: 'en', limit: 11 });

    expect(all).toHaveLength(8);
    expect(head).toEqual(all.slice(0, 4));
  });
});
