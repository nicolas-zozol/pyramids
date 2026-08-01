import { buildUrl, type UrlScheme } from '@robusta/pyramids-routing';
import type { ArticleIndexEntry } from '../content/article-index.js';

/**
 * The mapping from the v1 address space onto the v2 one.
 *
 * It is a function of the article index rather than a hand-kept table, which is
 * what keeps it from drifting: the day an article claims `solidity`, the rows
 * that mention it change without an edit. The three exported constants are the
 * v1 inventory no article index can produce — the raw markdown URLs, the tag
 * URLs, the declared category paths — read once from the v1 code and frozen.
 *
 * This module imports nothing from Next and nothing from React on purpose: it
 * is executed by `scripts/emit-redirects.mjs` outside the webpack pipeline.
 */

export type V1Destination =
  | { kind: 'permanent'; to: string }
  | { kind: 'gone' }
  | { kind: 'none'; why: string };

export interface V1MappingRow {
  from: string;
  destination: V1Destination;
  note?: string;
}

/** From `apps/robusta/src/logic/categories/robusta-categories.ts`. */
export const V1_DECLARED_CATEGORY_PATHS: readonly string[][] = [
  ['blockchain'],
  ['blockchain', 'ethers-js'],
  ['blockchain', 'solidity'],
  ['web'],
  ['javascript'],
  ['javascript', 'typescript'],
  ['javascript', 'react'],
];

/** The tags the v1 corpus carries, in the case they were published under. */
export const V1_TAG_URLS: readonly string[] = [
  '/learn/tag/web',
  '/learn/tag/tech',
  '/learn/tag/iot',
  '/learn/tag/language',
  '/learn/tag/state-of-the-art',
  '/learn/tag/blockchain',
  '/learn/tag/security',
  '/learn/tag/DeFi',
  '/learn/tag/solidity',
  '/learn/tag/javascript',
  '/learn/tag/front',
  '/learn/tag/react',
  '/learn/tag/rxjs',
  '/learn/tag/back',
];

/**
 * The raw markdown files published under `public/learn`. They are keyed by file
 * name and not by slug, so they are enumerated; the slug next to each one is
 * the article whose content travels. A slug the article index does not hold is
 * content that exists nowhere in the corpus, and its URL answers 410 — the day
 * migrate-learn-content republishes it, the row becomes a redirect and nothing
 * else changes.
 */
const V1_RAW_MARKDOWN: readonly { url: string; slug: string }[] = [
  { url: '/learn/blockchain/s/ledger-versus-metamask.md', slug: 'ledger-versus-metamask' },
  { url: '/learn/blockchain/s/start-coding-blockchain.md', slug: 'tooling-for-solidity-coders' },
  {
    url: '/learn/blockchain/s/yield-farming-fr.md',
    slug: 'provenance-des-rendements-du-yield-farming-dans-la-blockchain',
  },
  {
    url: '/learn/javascript/s/completes-with.md',
    slug: 'completing-a-rxjs-observable-with-another',
  },
  {
    url: '/learn/javascript/s/styled-components.md',
    slug: 'applying-correctly-classname-with-styled-components',
  },
  { url: '/learn/privacy/leaving-gmail.md', slug: 'leaving-gmail' },
  {
    url: '/learn/theory/quel-second-langage.md',
    slug: 'quel-langage-pour-progresser-dans-sa-carriere',
  },
  {
    url: '/learn/web/easy-automation-with-sonoff.md',
    slug: 'easy-automation-with-sonoff-and-javascript',
  },
  {
    url: '/learn/javascript/s/completes-with-fr.md',
    slug: 'terminer-un-observable-rxjs-avec-un-autre',
  },
  { url: '/learn/javascript/s/es6-7.md', slug: 'es-2015' },
  { url: '/learn/javascript/s/javascript-build.md', slug: 'javascript-build' },
  { url: '/learn/javascript/s/redux-en.md', slug: 'starting-redux' },
  { url: '/learn/theory/solid-principles.md', slug: 'solid-principles' },
];

export const V1_RAW_MARKDOWN_URLS: readonly string[] = V1_RAW_MARKDOWN.map(
  (entry) => entry.url,
);

const V1_ARTICLE_DISCRIMINANT = 's';
const V1_ROLL_DISCRIMINANT = 'page';
const V1_HOME = '/learn';

export function v1UrlMap(
  scheme: UrlScheme,
  articles: readonly ArticleIndexEntry[],
): V1MappingRow[] {
  const locales = [scheme.defaultLocale, ...scheme.otherLocales];

  return [
    ...blogHomeRows(scheme, locales),
    ...blogRollRows(scheme, locales),
    ...categoryRows(scheme, locales, articles),
    ...articleRows(scheme, articles),
    ...tagRows(scheme, articles),
    ...rawMarkdownRows(scheme, articles),
    ...imageRows(),
    ...portfolioRows(),
    ...developmentLeftoverRows(),
    ...namespaceRows(),
  ];
}

function blogHomeRows(scheme: UrlScheme, locales: readonly string[]): V1MappingRow[] {
  return locales.map((locale) => ({
    from: v1Path(scheme, locale, []),
    destination: {
      kind: 'permanent' as const,
      to: buildUrl(scheme, { kind: 'blog-home', locale, page: 1 }),
    },
  }));
}

function blogRollRows(
  scheme: UrlScheme,
  locales: readonly string[],
): V1MappingRow[] {
  return locales.map((locale) => ({
    from: v1Path(scheme, locale, [V1_ROLL_DISCRIMINANT, ':n']),
    destination: {
      kind: 'none' as const,
      why: 'v1 never generated one: its corpus of 11 articles never reached the roll size of 12',
    },
  }));
}

/**
 * v2 categories are flat, so a nested v1 path maps to its leaf and not to its
 * head — `javascript/typescript` reaches `/articles/c/typescript`. The page
 * number is dropped: the destination is the roll, whatever page of it was asked.
 */
function categoryRows(
  scheme: UrlScheme,
  locales: readonly string[],
  articles: readonly ArticleIndexEntry[],
): V1MappingRow[] {
  const rows: V1MappingRow[] = [];

  for (const locale of locales) {
    for (const path of V1_DECLARED_CATEGORY_PATHS) {
      const leaf = path[path.length - 1];
      const to = categoryOrHome(scheme, locale, leaf, articles);
      const note =
        path.length > 1 ? `flattened to its leaf '${leaf}'` : undefined;

      rows.push({
        from: v1Path(scheme, locale, path),
        destination: { kind: 'permanent', to },
        ...(note === undefined ? {} : { note }),
      });
      rows.push({
        from: v1Path(scheme, locale, [...path, V1_ROLL_DISCRIMINANT, ':n']),
        destination: { kind: 'permanent', to },
        note: 'the page number is dropped',
      });
    }
  }

  return rows;
}

/**
 * An article row's source is the URL the v1 build generated, which carries no
 * locale segment whatever the article's locale (R-MIGRATELEARN-61).
 * `apps/robusta/src/app/learn/[...path]/page.tsx:59` emits
 * `path: [...post.categories, 's', post.slug]` for every article, and every blog
 * route is `force-static`, so `/learn/fr/...` 404s on the live site while
 * `/learn/{category}/s/{slug}` is what v1 published for a French article as much
 * as for an English one.
 *
 * The fixture corpus hid this: it costs nothing until an article of a
 * non-default locale exists. With the real corpus it costs three rows, whose
 * true addresses would otherwise fall through to the `/learn/:path*` namespace
 * rule and answer 410 Gone — three indexed article URLs retired by accident.
 *
 * A non-default-locale article gets a second row at the locale-marked form,
 * reaching the same v2 URL. That costs three rows and matches what the category
 * class already does, AC-URLSCHEME-62 requiring `/learn/fr/javascript/page/2` to
 * have a destination.
 */
function articleRows(
  scheme: UrlScheme,
  articles: readonly ArticleIndexEntry[],
): V1MappingRow[] {
  return articles
    .filter((article) => article.category !== undefined)
    .flatMap((article) => {
      const category = article.category as string;
      const tail = [
        ...v1CategoryPath(category),
        V1_ARTICLE_DISCRIMINANT,
        article.slug,
      ];
      const destination = {
        kind: 'permanent' as const,
        to: buildUrl(scheme, {
          kind: 'article',
          locale: article.locale,
          category,
          slug: article.slug,
        }),
      };

      const rows: V1MappingRow[] = [
        { from: v1Path(scheme, scheme.defaultLocale, tail), destination },
      ];

      if (article.locale !== scheme.defaultLocale) {
        rows.push({
          from: v1Path(scheme, article.locale, tail),
          destination,
          note: `the locale-marked form; v1 published this article at the unmarked one`,
        });
      }

      return rows;
    });
}

/**
 * A tag reaches the category page of the same name when that category has a
 * page, and the blog home otherwise. A tag is never promoted to a category to
 * make a redirect land: an article carries at most one category
 * (BR-PYRAMID-9), and the address a tag page would take is reserved and unbuilt.
 */
function tagRows(
  scheme: UrlScheme,
  articles: readonly ArticleIndexEntry[],
): V1MappingRow[] {
  const rows: V1MappingRow[] = V1_TAG_URLS.map((url) => {
    const tag = url.slice(`${V1_HOME}/tag/`.length).toLowerCase();
    return {
      from: url,
      destination: {
        kind: 'permanent' as const,
        to: categoryOrHome(scheme, scheme.defaultLocale, tag, articles),
      },
    };
  });

  rows.push({
    from: `${V1_HOME}/tag/:tag/${V1_ROLL_DISCRIMINANT}/:n`,
    destination: {
      kind: 'none',
      why: 'no tag ever reached the roll size, so v1 generated no such URL',
    },
  });

  return rows;
}

function rawMarkdownRows(
  scheme: UrlScheme,
  articles: readonly ArticleIndexEntry[],
): V1MappingRow[] {
  return V1_RAW_MARKDOWN.map(({ url, slug }) => {
    const article = articles.find((entry) => entry.slug === slug);
    if (article === undefined) {
      return {
        from: url,
        destination: { kind: 'gone' as const },
        note: `no article carries the slug '${slug}': the content travels nowhere`,
      };
    }
    return {
      from: url,
      destination: {
        kind: 'permanent' as const,
        to: buildUrl(scheme, {
          kind: 'article',
          locale: article.locale,
          ...(article.category === undefined ? {} : { category: article.category }),
          slug: article.slug,
        }),
      },
    };
  });
}

function imageRows(): V1MappingRow[] {
  return [
    {
      from: `${V1_HOME}/:path*/images/:file`,
      destination: {
        kind: 'none',
        why: 'where the images end up on v2 is migrate-learn-content’s deliverable, so they fall through to 404 rather than being declared retired',
      },
    },
  ];
}

function portfolioRows(): V1MappingRow[] {
  const why =
    'let go by the arbitration of 2026-07-30: the portfolio is rebuilt fresh on the v2 design system';
  return [
    { from: '/portfolio', destination: { kind: 'none', why } },
    {
      from: '/fr/portfolio',
      destination: { kind: 'none', why },
      note: 'no route in the v1 code; it survives from an earlier site and is listed because the arbitration named it',
    },
  ];
}

function developmentLeftoverRows(): V1MappingRow[] {
  const why = 'development leftover with no editorial value';
  return [
    { from: '/', destination: { kind: 'none', why: 'the v2 landing serves the same URL' } },
    { from: '/prosemirror/:path*', destination: { kind: 'none', why } },
    { from: '/test/:path*', destination: { kind: 'none', why } },
    { from: '/_design-test', destination: { kind: 'none', why } },
  ];
}

function namespaceRows(): V1MappingRow[] {
  return [
    {
      from: `${V1_HOME}/:path*`,
      destination: { kind: 'gone' },
      note: 'the namespace rule, served by the /learn route handler rather than by a redirect: it answers for every document URL no row above claimed',
    },
  ];
}

function categoryOrHome(
  scheme: UrlScheme,
  locale: string,
  category: string,
  articles: readonly ArticleIndexEntry[],
): string {
  const claimed = articles.some(
    (article) => article.locale === locale && article.category === category,
  );
  return claimed
    ? buildUrl(scheme, { kind: 'category', locale, category, page: 1 })
    : buildUrl(scheme, { kind: 'blog-home', locale, page: 1 });
}

/** The v1 folder path of a v2 category: the declared path it is the leaf of, or itself. */
function v1CategoryPath(category: string): string[] {
  const declared = V1_DECLARED_CATEGORY_PATHS.find(
    (path) => path[path.length - 1] === category,
  );
  return declared === undefined ? [category] : [...declared];
}

function v1Path(scheme: UrlScheme, locale: string, tail: readonly string[]): string {
  const segments =
    locale === scheme.defaultLocale ? [...tail] : [locale, ...tail];
  return segments.length === 0 ? V1_HOME : `${V1_HOME}/${segments.join('/')}`;
}
