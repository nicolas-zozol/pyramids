import {
  CATEGORY_DISCRIMINANT,
  ROLL_PAGE_DISCRIMINANT,
  TAG_DISCRIMINANT,
  isReservedSegment,
} from './discriminants.ts';
import { knownLocales, type PageUrl, type UrlScheme } from './scheme.ts';

/**
 * Reads an unprefixed path as a page of the default locale, `/{other}…` as a
 * page of that locale, and `/{default}…` as the same page as its unprefixed
 * form, its canonical one; after a locale only its landing and its content
 * section are read. Anything else — `/404`, `/l/…`, `/de`,
 * `/{default}/{other}` — returns undefined, so the parser never claims a URL
 * the scheme does not own.
 *
 * It is deliberately tolerant where `buildUrl` is strict — a trailing slash,
 * an uppercase segment, an explicit page one and the marked default locale are
 * all read — which is what makes canonicality the fixed point of the pair
 * instead of hand-written redirect families.
 */
export function parseUrl(scheme: UrlScheme, path: string): PageUrl | undefined {
  if (!path.startsWith('/')) {
    return undefined;
  }

  const segments = path
    .toLowerCase()
    .split('/')
    .filter((segment) => segment !== '');
  const [first, ...rest] = segments;

  if (first !== undefined && knownLocales(scheme).includes(first)) {
    return readPageOfLocale(scheme, rest, first);
  }
  return readPageOfLocale(scheme, segments, scheme.defaultLocale);
}

function readPageOfLocale(
  scheme: UrlScheme,
  segments: string[],
  locale: string,
): PageUrl | undefined {
  if (segments.length === 0) {
    return { kind: 'landing', locale };
  }

  const [head, ...rest] = segments;
  if (head !== scheme.contentRoot.toLowerCase()) {
    return undefined;
  }

  return readContentSection(rest, locale);
}

function readContentSection(rest: string[], locale: string): PageUrl | undefined {
  if (rest.length === 0) {
    return { kind: 'blog-home', locale, page: 1 };
  }

  const [head, ...tail] = rest;

  if (head === ROLL_PAGE_DISCRIMINANT) {
    const page = readPageNumber(tail);
    return page === undefined ? undefined : { kind: 'blog-home', locale, page };
  }

  if (head === CATEGORY_DISCRIMINANT) {
    return readNamedRoll(tail, (category, page, slug) =>
      slug === undefined
        ? { kind: 'category', locale, category, page }
        : { kind: 'article', locale, category, slug },
    );
  }

  if (head === TAG_DISCRIMINANT) {
    return readNamedRoll(tail, (tag, page, slug) =>
      slug === undefined ? { kind: 'tag', locale, tag, page } : undefined,
    );
  }

  if (tail.length > 0 || isReservedSegment(head)) {
    return undefined;
  }
  return { kind: 'article', locale, slug: head };
}

/**
 * The tail of `/c/{name}` and `/t/{name}`: the roll itself, its page `n`, or —
 * under the category discriminant only — one more segment, which is an article
 * slug. Anything deeper is outside the scheme; nesting is what the design drops.
 */
function readNamedRoll(
  tail: string[],
  compose: (name: string, page: number, slug?: string) => PageUrl | undefined,
): PageUrl | undefined {
  const [name, ...rest] = tail;
  if (name === undefined || isReservedSegment(name)) {
    return undefined;
  }

  if (rest.length === 0) {
    return compose(name, 1);
  }

  if (rest[0] === ROLL_PAGE_DISCRIMINANT) {
    const page = readPageNumber(rest.slice(1));
    return page === undefined ? undefined : compose(name, page);
  }

  if (rest.length === 1 && !isReservedSegment(rest[0])) {
    return compose(name, 1, rest[0]);
  }
  return undefined;
}

function readPageNumber(segments: string[]): number | undefined {
  if (segments.length !== 1 || !/^\d+$/.test(segments[0])) {
    return undefined;
  }
  const page = Number(segments[0]);
  return page >= 1 ? page : undefined;
}
