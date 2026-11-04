import { describe, expect, it } from 'vitest';
import type { ArticleIndexEntry } from '../content/article-index.ts';
import { urlScheme } from '../routing/scheme.ts';
import { buildUrl, urlSet } from '../routing/url-scheme/index.ts';
import { localeRolls, localeRollsOf } from './locale-rolls.ts';

function article(
  locale: string,
  slug: string,
  category?: string,
): ArticleIndexEntry {
  return {
    path: `${category ?? ''}/${slug}.md`,
    slug,
    locale,
    ...(category === undefined ? {} : { category }),
    title: slug,
    date: '2022-01-20',
    author: 'Nicolas Zozol',
    tags: [],
    excerpt: 'An excerpt.',
  };
}

const rollsOf = (locale: string, index: readonly ArticleIndexEntry[]) =>
  localeRollsOf(locale, index, urlSet(urlScheme, index)).map((roll) =>
    buildUrl(urlScheme, roll),
  );

describe('localeRollsOf', () => {
  it('gives the first page of each roll of the Locale, blog home first, then the Categories by slug', () => {
    const index = [
      ...Array.from({ length: 13 }, (_, i) => article('en', `web-${i}`, 'web')),
      article('en', 'a-privacy-one', 'privacy'),
      article('en', 'a-blockchain-one', 'blockchain'),
    ];

    expect(rollsOf('en', index)).toEqual([
      '/articles',
      '/articles/c/blockchain',
      '/articles/c/privacy',
      '/articles/c/web',
    ]);
  });

  it('gives nothing to a Locale without a published article, the default Locale included', () => {
    const index = [article('fr', 'quel-second-langage', 'theory')];

    expect(rollsOf('en', index)).toEqual([]);
    expect(rollsOf('es', index)).toEqual([]);
    expect(rollsOf('fr', index)).toEqual([
      '/fr/articles',
      '/fr/articles/c/theory',
    ]);
  });

  it('gives an article without Category the blog home alone', () => {
    expect(rollsOf('en', [article('en', 'untagged')])).toEqual(['/articles']);
  });

  it('drops a Category whose only article stops being published', () => {
    const index = [
      article('fr', 'quel-second-langage', 'theory'),
      article('fr', 'quitter-gmail', 'privacy'),
    ];
    const unpublished = index.filter((entry) => entry.category !== 'theory');

    expect(rollsOf('fr', unpublished)).toEqual([
      '/fr/articles',
      '/fr/articles/c/privacy',
    ]);
  });
});

/** `getLocaleRolls`'s handler, on the site's own corpus. */
describe('localeRolls', () => {
  const at = async (locale: string) =>
    (await localeRolls({ locale })).map((roll) => buildUrl(urlScheme, roll));

  it('gives English its blog home and five Categories, theory not among them', async () => {
    expect(await at('en')).toEqual([
      '/articles',
      '/articles/c/blockchain',
      '/articles/c/javascript',
      '/articles/c/privacy',
      '/articles/c/typescript',
      '/articles/c/web',
    ]);
  });

  it('gives French its blog home and six Categories, theory included', async () => {
    expect(await at('fr')).toContain('/fr/articles/c/theory');
    expect(await at('fr')).toHaveLength(7);
  });

  it('gives Spanish nothing while no Spanish article is published', async () => {
    expect(await at('es')).toEqual([]);
  });
});
