import { buildUrl, urlSet } from './url-scheme/index.js';
import { describe, expect, it } from 'vitest';
import { getArticleIndex } from '../content/article-index.js';
import { urlScheme } from './scheme.js';
import {
  V1_ARTICLE_SLUGS,
  V1_LOCALES,
  v1UrlMap,
  type V1MappingRow,
} from './v1-url-map.js';

/**
 * The v1 address space and the outcome of each address, extracted once from the
 * map committed before `fr` became the site's default Locale
 * (`git show HEAD:apps/robusta-build/src/routing/v1-url-map.generated.json`).
 * What v1 published does not move when the v2 site changes its Locales or
 * publishes a translation. One outcome moved since: `completes-with-fr.md` was
 * Gone until its French translation was published, and now redirects to it.
 */
const V1_INVENTORY: readonly (readonly [
  string,
  V1MappingRow['destination']['kind'],
])[] = [
  ['/learn', 'permanent'],
  ['/learn/fr', 'permanent'],
  ['/learn/page/:n', 'none'],
  ['/learn/fr/page/:n', 'none'],
  ['/learn/blockchain', 'permanent'],
  ['/learn/blockchain/page/:n', 'permanent'],
  ['/learn/blockchain/ethers-js', 'permanent'],
  ['/learn/blockchain/ethers-js/page/:n', 'permanent'],
  ['/learn/blockchain/solidity', 'permanent'],
  ['/learn/blockchain/solidity/page/:n', 'permanent'],
  ['/learn/web', 'permanent'],
  ['/learn/web/page/:n', 'permanent'],
  ['/learn/javascript', 'permanent'],
  ['/learn/javascript/page/:n', 'permanent'],
  ['/learn/javascript/typescript', 'permanent'],
  ['/learn/javascript/typescript/page/:n', 'permanent'],
  ['/learn/javascript/react', 'permanent'],
  ['/learn/javascript/react/page/:n', 'permanent'],
  ['/learn/fr/blockchain', 'permanent'],
  ['/learn/fr/blockchain/page/:n', 'permanent'],
  ['/learn/fr/blockchain/ethers-js', 'permanent'],
  ['/learn/fr/blockchain/ethers-js/page/:n', 'permanent'],
  ['/learn/fr/blockchain/solidity', 'permanent'],
  ['/learn/fr/blockchain/solidity/page/:n', 'permanent'],
  ['/learn/fr/web', 'permanent'],
  ['/learn/fr/web/page/:n', 'permanent'],
  ['/learn/fr/javascript', 'permanent'],
  ['/learn/fr/javascript/page/:n', 'permanent'],
  ['/learn/fr/javascript/typescript', 'permanent'],
  ['/learn/fr/javascript/typescript/page/:n', 'permanent'],
  ['/learn/fr/javascript/react', 'permanent'],
  ['/learn/fr/javascript/react/page/:n', 'permanent'],
  ['/learn/blockchain/s/ledger-versus-metamask', 'permanent'],
  ['/learn/blockchain/s/tooling-for-solidity-coders', 'permanent'],
  [
    '/learn/blockchain/s/provenance-des-rendements-du-yield-farming-dans-la-blockchain',
    'permanent',
  ],
  [
    '/learn/fr/blockchain/s/provenance-des-rendements-du-yield-farming-dans-la-blockchain',
    'permanent',
  ],
  ['/learn/blockchain/s/the-source-of-yield-farming-profits', 'permanent'],
  ['/learn/javascript/s/pourquoi-jai-migre-de-gatsby-vers-nextjs', 'permanent'],
  [
    '/learn/fr/javascript/s/pourquoi-jai-migre-de-gatsby-vers-nextjs',
    'permanent',
  ],
  [
    '/learn/javascript/s/why-i-made-the-migration-from-gatsby-toward-nextjs',
    'permanent',
  ],
  [
    '/learn/javascript/typescript/s/completing-a-rxjs-observable-with-another',
    'permanent',
  ],
  ['/learn/web/s/easy-automation-with-sonoff-and-javascript', 'permanent'],
  [
    '/learn/theory/s/quel-langage-pour-progresser-dans-sa-carriere',
    'permanent',
  ],
  [
    '/learn/fr/theory/s/quel-langage-pour-progresser-dans-sa-carriere',
    'permanent',
  ],
  [
    '/learn/javascript/s/applying-correctly-classname-with-styled-components',
    'permanent',
  ],
  ['/learn/privacy/s/leaving-gmail', 'permanent'],
  ['/learn/tag/web', 'permanent'],
  ['/learn/tag/tech', 'permanent'],
  ['/learn/tag/iot', 'permanent'],
  ['/learn/tag/language', 'permanent'],
  ['/learn/tag/state-of-the-art', 'permanent'],
  ['/learn/tag/blockchain', 'permanent'],
  ['/learn/tag/security', 'permanent'],
  ['/learn/tag/DeFi', 'permanent'],
  ['/learn/tag/solidity', 'permanent'],
  ['/learn/tag/javascript', 'permanent'],
  ['/learn/tag/front', 'permanent'],
  ['/learn/tag/react', 'permanent'],
  ['/learn/tag/rxjs', 'permanent'],
  ['/learn/tag/back', 'permanent'],
  ['/learn/tag/:tag/page/:n', 'none'],
  ['/learn/blockchain/s/ledger-versus-metamask.md', 'permanent'],
  ['/learn/blockchain/s/start-coding-blockchain.md', 'permanent'],
  ['/learn/blockchain/s/yield-farming-fr.md', 'permanent'],
  ['/learn/javascript/s/completes-with.md', 'permanent'],
  ['/learn/javascript/s/styled-components.md', 'permanent'],
  ['/learn/privacy/leaving-gmail.md', 'permanent'],
  ['/learn/theory/quel-second-langage.md', 'permanent'],
  ['/learn/web/easy-automation-with-sonoff.md', 'permanent'],
  ['/learn/javascript/s/completes-with-fr.md', 'permanent'],
  ['/learn/javascript/s/es6-7.md', 'gone'],
  ['/learn/javascript/s/javascript-build.md', 'gone'],
  ['/learn/javascript/s/redux-en.md', 'gone'],
  ['/learn/theory/solid-principles.md', 'gone'],
  ['/learn/:path*/images/:file', 'none'],
  ['/portfolio', 'none'],
  ['/fr/portfolio', 'none'],
  ['/', 'none'],
  ['/prosemirror/:path*', 'none'],
  ['/test/:path*', 'none'],
  ['/_design-test', 'none'],
  ['/learn/:path*', 'gone'],
];

const mapOfTheSite = async () => v1UrlMap(urlScheme, await getArticleIndex());

const destinationOf = (rows: V1MappingRow[], from: string) =>
  rows.find((row) => row.from === from)?.destination;

describe('V1_LOCALES', () => {
  it('freezes the Locales v1 published: en by default, then fr', () => {
    expect(V1_LOCALES).toEqual({ defaultLocale: 'en', otherLocales: ['fr'] });
  });
});

describe('v1UrlMap over the site’s corpus', () => {
  it('lists the same eighty-two v1 addresses in the same order, the French raw markdown of completes-with now redirected', async () => {
    const rows = await mapOfTheSite();

    expect(rows.map((row) => [row.from, row.destination.kind])).toEqual(
      V1_INVENTORY,
    );
  });

  it('counts sixty-seven permanent rows, five gone and ten without destination', async () => {
    const kinds = (await mapOfTheSite()).map((row) => row.destination.kind);

    expect(kinds.filter((kind) => kind === 'permanent')).toHaveLength(67);
    expect(kinds.filter((kind) => kind === 'gone')).toHaveLength(5);
    expect(kinds.filter((kind) => kind === 'none')).toHaveLength(10);
  });

  it('computes its sources from the v1 Locales, whatever Locales the scheme declares', async () => {
    const index = await getArticleIndex();
    const sources = (rows: V1MappingRow[]) =>
      rows.map((row) => [row.from, row.destination.kind]);

    const swapped = v1UrlMap(
      { ...urlScheme, defaultLocale: 'fr', otherLocales: ['en'] },
      index,
    );
    const frenchOnly = v1UrlMap(
      { ...urlScheme, defaultLocale: 'fr', otherLocales: [] },
      index,
    );

    expect(sources(swapped)).toEqual(sources(v1UrlMap(urlScheme, index)));
    expect(sources(frenchOnly)).toEqual(sources(v1UrlMap(urlScheme, index)));
  });

  it('leads every permanent row to a URL the site builds', async () => {
    const index = await getArticleIndex();
    const built = new Set(
      urlSet(urlScheme, index).map((page) => buildUrl(urlScheme, page)),
    );

    const destinations = v1UrlMap(urlScheme, index).flatMap((row) =>
      row.destination.kind === 'permanent' ? [row.destination.to] : [],
    );

    expect(destinations).toHaveLength(67);
    expect(destinations.filter((to) => !built.has(to))).toEqual([]);
  });

  it('leads the French v1 listings under /fr and the unmarked ones under /en', async () => {
    const rows = await mapOfTheSite();

    expect(destinationOf(rows, '/learn/fr/blockchain')).toEqual({
      kind: 'permanent',
      to: '/fr/articles/c/blockchain',
    });
    expect(destinationOf(rows, '/learn')).toEqual({
      kind: 'permanent',
      to: '/en/articles',
    });
    expect(destinationOf(rows, '/learn/tag/web')).toEqual({
      kind: 'permanent',
      to: '/en/articles/c/web',
    });
  });

  it('leads a v1 category no article of its Locale claims to the blog roll of that Locale', async () => {
    const rows = await mapOfTheSite();

    expect(destinationOf(rows, '/learn/fr/blockchain/solidity')).toEqual({
      kind: 'permanent',
      to: '/fr/articles',
    });
    expect(destinationOf(rows, '/learn/javascript/react')).toEqual({
      kind: 'permanent',
      to: '/en/articles',
    });
  });

  it('gives an article v1 never published no v1 address, a translation included', async () => {
    const index = await getArticleIndex();
    const unknownToV1 = index.filter(
      (entry) => !V1_ARTICLE_SLUGS.includes(entry.slug),
    );
    const sources = v1UrlMap(urlScheme, index).map((row) => row.from);

    expect(unknownToV1.map((entry) => entry.slug)).toContain('quitter-gmail');
    expect(
      unknownToV1.filter((entry) =>
        sources.some((from) => from.endsWith(`/s/${entry.slug}`)),
      ),
    ).toEqual([]);
  });

  it('leads a French v1 category its translations now claim to its French page', async () => {
    const rows = await mapOfTheSite();

    expect(destinationOf(rows, '/learn/fr/web')).toEqual({
      kind: 'permanent',
      to: '/fr/articles/c/web',
    });
  });

  it('keeps every v1 listing and tag in the language of its v1 page', async () => {
    const listings = (await mapOfTheSite()).filter(
      (row) =>
        row.destination.kind === 'permanent' &&
        !row.from.includes('/s/') &&
        !row.from.endsWith('.md'),
    );
    const to = (row: V1MappingRow) =>
      row.destination.kind === 'permanent' ? row.destination.to : '';

    const french = listings.filter((row) => row.from.startsWith('/learn/fr'));
    const english = listings.filter((row) => !row.from.startsWith('/learn/fr'));

    expect(french).toHaveLength(15);
    expect(french.every((row) => to(row).startsWith('/fr/'))).toBe(true);
    expect(english).toHaveLength(29);
    expect(english.every((row) => to(row).startsWith('/en/'))).toBe(true);
  });
});
