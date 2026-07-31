import { describe, expect, it } from 'vitest';
import { buildUrl } from './build-url.js';
import { parseUrl } from './parse-url.js';
import type { PageUrl, UrlScheme } from './scheme.js';

/**
 * The property that carries the whole scheme (R-URLSCHEME-21):
 *
 *   a path p is canonical exactly when buildUrl(scheme, parseUrl(scheme, p)) === p
 *
 * Every redirect family falls out of it rather than being written by hand — the
 * explicit page one, the marked default locale, the trailing slash and the
 * uppercase variant are each a path the parser reads and the builder does not
 * emit, so each is a redirect source whose target is the built value.
 *
 * The inputs are generated rather than listed: a seeded generator crosses three
 * schemes with every page kind, every locale, several page numbers and a few
 * hundred slugs, so a rule that only holds for the examples someone thought of
 * fails here.
 */

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomSegment(next: () => number): string {
  const words = 1 + Math.floor(next() * 3);
  const parts: string[] = [];
  for (let w = 0; w < words; w++) {
    const length = 1 + Math.floor(next() * 8);
    let part = '';
    for (let i = 0; i < length; i++) {
      part += ALPHABET[Math.floor(next() * ALPHABET.length)];
    }
    parts.push(part);
  }
  // A generated segment may collide with a discriminant; the scheme forbids
  // that value as a slug, so the generator does not produce it either.
  const segment = parts.join('-');
  return segment.length === 1 && 'lcpt'.includes(segment) ? `${segment}x` : segment;
}

const schemes: UrlScheme[] = [
  {
    contentRoot: 'articles',
    defaultLocale: 'en',
    otherLocales: ['fr'],
    rollSize: 12,
  },
  { contentRoot: 'spots', defaultLocale: 'fr', otherLocales: ['en'], rollSize: 3 },
  {
    contentRoot: 'guides',
    defaultLocale: 'en',
    otherLocales: ['fr', 'es', 'de'],
    rollSize: 1,
  },
];

function generatePages(scheme: UrlScheme, seed: number): PageUrl[] {
  const next = seededRandom(seed);
  const locales = [scheme.defaultLocale, ...scheme.otherLocales];
  const pages: PageUrl[] = [];
  for (const locale of locales) {
    pages.push({ kind: 'landing', locale });
    for (const page of [1, 2, 3, 7, 41, 999]) {
      pages.push({ kind: 'blog-home', locale, page });
      pages.push({ kind: 'category', locale, category: randomSegment(next), page });
      pages.push({ kind: 'tag', locale, tag: randomSegment(next), page });
    }
    for (let i = 0; i < 40; i++) {
      pages.push({ kind: 'article', locale, slug: randomSegment(next) });
      pages.push({
        kind: 'article',
        locale,
        category: randomSegment(next),
        slug: randomSegment(next),
      });
    }
  }
  return pages;
}

/** The landing is buildable and not parseable: the parser claims the content section only. */
function isParseable(page: PageUrl): boolean {
  return page.kind !== 'landing';
}

describe('canonicality is the fixed point of buildUrl and parseUrl', () => {
  for (const scheme of schemes) {
    const pages = generatePages(scheme, 20260731);
    const parseable = pages.filter(isParseable);

    it(`round-trips every generated page of the ${scheme.contentRoot} scheme`, () => {
      expect(parseable.length).toBeGreaterThan(100);
      for (const page of parseable) {
        const url = buildUrl(scheme, page);
        expect(parseUrl(scheme, url), url).toEqual(page);
      }
    });

    it(`holds buildUrl(parseUrl(p)) === p on every URL it emits, for ${scheme.contentRoot}`, () => {
      for (const page of parseable) {
        const url = buildUrl(scheme, page);
        const parsed = parseUrl(scheme, url);
        expect(parsed, url).toBeDefined();
        expect(buildUrl(scheme, parsed as PageUrl)).toBe(url);
      }
    });

    it(`emits distinct URLs for distinct pages of the ${scheme.contentRoot} scheme`, () => {
      const urls = pages.map((page) => buildUrl(scheme, page));
      expect(new Set(urls).size).toBe(new Set(pages.map((p) => JSON.stringify(p))).size);
    });
  }
});

/**
 * The four non-canonical families. Each mutation produces a path the parser
 * reads and the builder never emits, so each is a redirect source whose target
 * is the canonical form — R-URLSCHEME-8, 9 and 10.
 */
type Mutation = {
  name: string;
  applies: (scheme: UrlScheme, page: PageUrl) => boolean;
  mutate: (scheme: UrlScheme, page: PageUrl, canonical: string) => string;
};

const mutations: Mutation[] = [
  {
    name: 'the explicit page one',
    applies: (_scheme, page) =>
      (page.kind === 'blog-home' || page.kind === 'category' || page.kind === 'tag') &&
      page.page === 1,
    mutate: (_scheme, _page, canonical) => `${canonical}/p/1`,
  },
  {
    name: 'the marked default locale',
    applies: (scheme, page) => page.kind !== 'landing' && page.locale === scheme.defaultLocale,
    mutate: (scheme, _page, canonical) => `/l/${scheme.defaultLocale}${canonical}`,
  },
  {
    name: 'the trailing slash',
    applies: (_scheme, page) => page.kind !== 'landing',
    mutate: (_scheme, _page, canonical) => `${canonical}/`,
  },
  {
    name: 'the uppercase variant',
    applies: (_scheme, page) => page.kind !== 'landing',
    mutate: (_scheme, _page, canonical) => canonical.toUpperCase(),
  },
];

describe('the non-canonical families fall out of the fixed point', () => {
  for (const scheme of schemes) {
    const pages = generatePages(scheme, 424242).filter(isParseable);

    for (const mutation of mutations) {
      it(`${mutation.name} is non-canonical and redirects to the built value, for ${scheme.contentRoot}`, () => {
        const applicable = pages.filter((page) => mutation.applies(scheme, page));
        expect(applicable.length).toBeGreaterThan(0);

        for (const page of applicable) {
          const canonical = buildUrl(scheme, page);
          const variant = mutation.mutate(scheme, page, canonical);

          expect(variant, `${mutation.name} must differ from ${canonical}`).not.toBe(canonical);

          const parsed = parseUrl(scheme, variant);
          expect(parsed, `${variant} must be readable`).toBeDefined();
          expect(buildUrl(scheme, parsed as PageUrl), variant).toBe(canonical);
        }
      });
    }
  }
});
