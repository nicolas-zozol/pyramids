import { describe, expect, it } from 'vitest';
import { parseUrl } from './parse-url.ts';
import type { UrlScheme } from './scheme.ts';

const scheme: UrlScheme = {
  contentRoot: 'articles',
  defaultLocale: 'en',
  otherLocales: ['fr', 'es'],
  rollSize: 12,
};

describe('parseUrl', () => {
  // AC-URLSCHEME-01: the shape alone decides, no article set is consulted.
  it('reads an article from the shape of its URL', () => {
    expect(parseUrl(scheme, '/en/articles/leaving-gmail')).toEqual({
      kind: 'article',
      locale: 'en',
      slug: 'leaving-gmail',
    });
  });

  it('reads a categorised article from the shape of its URL', () => {
    expect(
      parseUrl(scheme, '/en/articles/c/javascript/styled-components'),
    ).toEqual({
      kind: 'article',
      locale: 'en',
      category: 'javascript',
      slug: 'styled-components',
    });
  });

  it('reads the blog home, its roll pages and a category roll', () => {
    expect(parseUrl(scheme, '/en/articles')).toEqual({
      kind: 'blog-home',
      locale: 'en',
      page: 1,
    });
    expect(parseUrl(scheme, '/en/articles/p/4')).toEqual({
      kind: 'blog-home',
      locale: 'en',
      page: 4,
    });
    expect(parseUrl(scheme, '/en/articles/c/web/p/2')).toEqual({
      kind: 'category',
      locale: 'en',
      category: 'web',
      page: 2,
    });
  });

  it('reads the locale from the first segment, whichever locale it is', () => {
    expect(parseUrl(scheme, '/fr/articles/c/web')).toEqual({
      kind: 'category',
      locale: 'fr',
      category: 'web',
      page: 1,
    });
    expect(parseUrl(scheme, '/es/articles')).toEqual({
      kind: 'blog-home',
      locale: 'es',
      page: 1,
    });
  });

  it('reads the landing of every known locale', () => {
    expect(parseUrl(scheme, '/en')).toEqual({ kind: 'landing', locale: 'en' });
    expect(parseUrl(scheme, '/fr')).toEqual({ kind: 'landing', locale: 'fr' });
    expect(parseUrl(scheme, '/es')).toEqual({ kind: 'landing', locale: 'es' });
  });

  // R-URLSCHEME-31: the parser knows the tag shape even though nothing serves it.
  it('reads a tag URL', () => {
    expect(parseUrl(scheme, '/en/articles/t/rxjs')).toEqual({
      kind: 'tag',
      locale: 'en',
      tag: 'rxjs',
      page: 1,
    });
  });

  it('claims nothing whose first segment is no known locale', () => {
    expect(parseUrl(scheme, '/')).toBeUndefined();
    expect(parseUrl(scheme, '/articles')).toBeUndefined();
    expect(parseUrl(scheme, '/articles/c/blockchain')).toBeUndefined();
    expect(parseUrl(scheme, '/l/en/articles')).toBeUndefined();
    expect(parseUrl(scheme, '/l/fr')).toBeUndefined();
    expect(parseUrl(scheme, '/404')).toBeUndefined();
    expect(parseUrl(scheme, '/de')).toBeUndefined();
    expect(parseUrl(scheme, '/de/articles')).toBeUndefined();
    expect(parseUrl(scheme, '/learn/blockchain')).toBeUndefined();
  });

  it('claims nothing under a known locale but outside its landing and its content section', () => {
    expect(parseUrl(scheme, '/en/pricing')).toBeUndefined();
    expect(parseUrl(scheme, '/en/fr/articles')).toBeUndefined();
  });

  // R-URLSCHEME-11: a discriminant is never a slug, so these shapes read as nothing.
  it('refuses a reserved segment where a slug or a category is expected', () => {
    expect(parseUrl(scheme, '/en/articles/c')).toBeUndefined();
    expect(parseUrl(scheme, '/en/articles/p')).toBeUndefined();
    expect(parseUrl(scheme, '/en/articles/t')).toBeUndefined();
    expect(parseUrl(scheme, '/en/articles/c/p/2')).toBeUndefined();
    expect(parseUrl(scheme, '/en/articles/c/web/p')).toBeUndefined();
  });

  it('reads `l` as an ordinary slug, the locale discriminant being gone', () => {
    expect(parseUrl(scheme, '/en/articles/l')).toEqual({
      kind: 'article',
      locale: 'en',
      slug: 'l',
    });
  });

  it('refuses a roll page that is not a positive integer', () => {
    expect(parseUrl(scheme, '/en/articles/p/0')).toBeUndefined();
    expect(parseUrl(scheme, '/en/articles/p/two')).toBeUndefined();
    expect(parseUrl(scheme, '/en/articles/p/2x')).toBeUndefined();
    expect(parseUrl(scheme, '/en/articles/p/-1')).toBeUndefined();
  });

  it('refuses a URL deeper than the scheme goes', () => {
    expect(
      parseUrl(scheme, '/en/articles/c/javascript/typescript/completes-with'),
    ).toBeUndefined();
    expect(parseUrl(scheme, '/en/articles/c/web/p/2/3')).toBeUndefined();
  });

  it('reads the non-canonical forms so a redirect target can be built from them', () => {
    expect(parseUrl(scheme, '/en/articles/p/1')).toEqual({
      kind: 'blog-home',
      locale: 'en',
      page: 1,
    });
    expect(parseUrl(scheme, '/en/articles/leaving-gmail/')).toEqual({
      kind: 'article',
      locale: 'en',
      slug: 'leaving-gmail',
    });
    expect(parseUrl(scheme, '/EN/Articles/Leaving-Gmail')).toEqual({
      kind: 'article',
      locale: 'en',
      slug: 'leaving-gmail',
    });
  });

  it('reads a landing with a trailing slash or in uppercase', () => {
    expect(parseUrl(scheme, '/fr/')).toEqual({ kind: 'landing', locale: 'fr' });
    expect(parseUrl(scheme, '/FR')).toEqual({ kind: 'landing', locale: 'fr' });
  });

  it('is called with a path and rejects anything that is not one', () => {
    expect(parseUrl(scheme, 'en/articles')).toBeUndefined();
    expect(parseUrl(scheme, '')).toBeUndefined();
  });
});
