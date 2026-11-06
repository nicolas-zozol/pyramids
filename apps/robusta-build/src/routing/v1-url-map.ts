import { buildUrl, type UrlScheme } from './url-scheme/index.ts';
import type { ArticleIndexEntry } from '../content/article-index.ts';

/**
 * The mapping from the v1 address space onto the v2 one.
 *
 * It is a function of the article index rather than a hand-kept table, which is
 * what keeps it from drifting: the day an article claims `solidity`, the rows
 * that mention it change without an edit. The exported constants are the v1
 * inventory no article index can produce — the Locales v1 published, the raw
 * markdown URLs, the tag URLs, the declared category paths — read once from the
 * v1 code and frozen, the slugs of the articles v1 published among them.
 * Every source is computed with them alone; only the
 * destinations read the scheme of the v2 site, each in the language of its v1
 * page.
 *
 * This module imports nothing from React on purpose: it is executed by
 * `scripts/emit-v1-map.mjs` in plain Node.
 *
 * Design: features/pyramid-v2-epic/__done/seo-url-scheme/seo-url-scheme.design.md
 * Requirements: R-URLSCHEME-14, R-URLSCHEME-15, R-URLSCHEME-25, R-URLSCHEME-26, R-URLSCHEME-27, R-URLSCHEME-28
 * Design: features/pyramid-v2-epic/__done/migrate-learn-content/migrate-learn-content.design.md
 * Requirements: R-MIGRATELEARN-61
 * Design: features/pyramid-v2-epic/__done/default-locale-fr/default-locale-fr.design.md
 * Requirements: R-DEFAULTLOCALE-21, R-DEFAULTLOCALE-22
 * Design: features/pyramid-v2-epic/__done/default-locale-at-root/default-locale-at-root.design.md
 * Requirements: R-ROOTLOCALE-81
 * Design: features/pyramid-v2-epic/restore-v1-urls/restore-v1-urls.design.md
 * Requirements: R-RESTOREV1-41, R-RESTOREV1-42, R-RESTOREV1-43
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

/** The Locales v1 published under `/learn`: `en` unmarked, `fr` under `/learn/fr`. */
export const V1_LOCALES: Pick<UrlScheme, 'defaultLocale' | 'otherLocales'> = {
  defaultLocale: 'en',
  otherLocales: ['fr'],
};

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
 * The slugs of the eleven articles v1 published. An article of the v2 corpus
 * outside this list, a translation written after v1, has no v1 address, so it
 * gets no article row.
 */
export const V1_ARTICLE_SLUGS: readonly string[] = [
  'ledger-versus-metamask',
  'tooling-for-solidity-coders',
  'provenance-des-rendements-du-yield-farming-dans-la-blockchain',
  'the-source-of-yield-farming-profits',
  'pourquoi-jai-migre-de-gatsby-vers-nextjs',
  'why-i-made-the-migration-from-gatsby-toward-nextjs',
  'completing-a-rxjs-observable-with-another',
  'easy-automation-with-sonoff-and-javascript',
  'quel-langage-pour-progresser-dans-sa-carriere',
  'applying-correctly-classname-with-styled-components',
  'leaving-gmail',
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

/** Every v1 address, led to the page `scheme` builds in the language of its v1 page. */
export function v1UrlMap(
  scheme: UrlScheme,
  articles: readonly ArticleIndexEntry[],
): V1MappingRow[] {
  const locales = [V1_LOCALES.defaultLocale, ...V1_LOCALES.otherLocales];

  return [
    ...blogHomeRows(scheme, locales),
    ...blogRollRows(locales),
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
    from: v1Path(locale, []),
    destination: {
      kind: 'permanent' as const,
      to: buildUrl(scheme, { kind: 'blog-home', locale, page: 1 }),
    },
  }));
}

function blogRollRows(locales: readonly string[]): V1MappingRow[] {
  return locales.map((locale) => ({
    from: v1Path(locale, [V1_ROLL_DISCRIMINANT, ':n']),
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
        from: v1Path(locale, path),
        destination: { kind: 'permanent', to },
        ...(note === undefined ? {} : { note }),
      });
      rows.push({
        from: v1Path(locale, [...path, V1_ROLL_DISCRIMINANT, ':n']),
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
 * The fixture corpus hid this: it costs nothing until an article of a Locale
 * other than v1's default exists. With the real corpus it costs three rows,
 * whose true addresses would otherwise fall through to the `/learn/:path*`
 * namespace rule and answer 410 Gone — three indexed article URLs retired by
 * accident.
 *
 * An article of a Locale other than v1's default gets a second row at the
 * locale-marked form, reaching the same v2 URL. That costs three rows and matches what the category
 * class already does, AC-URLSCHEME-62 requiring `/learn/fr/javascript/page/2` to
 * have a destination.
 */
function articleRows(
  scheme: UrlScheme,
  articles: readonly ArticleIndexEntry[],
): V1MappingRow[] {
  return articles
    .filter(
      (article) =>
        article.category !== undefined && V1_ARTICLE_SLUGS.includes(article.slug),
    )
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
        { from: v1Path(V1_LOCALES.defaultLocale, tail), destination },
      ];

      if (article.locale !== V1_LOCALES.defaultLocale) {
        rows.push({
          from: v1Path(article.locale, tail),
          destination,
          note: `the locale-marked form; v1 published this article at the unmarked one`,
        });
      }

      return rows;
    });
}

/**
 * A tag reaches the category page of the same name when that category has a
 * page, and the blog home otherwise, both in v1's default Locale: v1 published
 * its tag pages unmarked. A tag is never promoted to a category to
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
        to: categoryOrHome(scheme, V1_LOCALES.defaultLocale, tag, articles),
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
  const destination = {
    kind: 'none' as const,
    why: 'where the images end up on v2 is migrate-learn-content’s deliverable, so they fall through to 404 rather than being declared retired',
  };
  return [
    { from: `${V1_HOME}/images/:file`, destination },
    { from: `${V1_HOME}/:category/${V1_ARTICLE_DISCRIMINANT}/images/:file`, destination },
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
    { from: '/', destination: { kind: 'none', why: 'the v2 site serves its English landing page at this same address' } },
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
      note: 'the namespace rule, served by the last rule of _redirects: it answers for every document URL no row above claimed',
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

function v1Path(locale: string, tail: readonly string[]): string {
  const segments =
    locale === V1_LOCALES.defaultLocale ? [...tail] : [locale, ...tail];
  return segments.length === 0 ? V1_HOME : `${V1_HOME}/${segments.join('/')}`;
}
