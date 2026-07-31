import { describe, expect, it } from 'vitest';
import { parseUrl } from './parse-url.js';
import type { UrlScheme } from './scheme.js';

const scheme: UrlScheme = {
  contentRoot: 'articles',
  defaultLocale: 'en',
  otherLocales: ['fr'],
  rollSize: 12,
};

describe('parseUrl', () => {
  // AC-URLSCHEME-01: the shape alone decides, no article set is consulted.
  it('reads an article from the shape of its URL', () => {
    expect(parseUrl(scheme, '/articles/leaving-gmail')).toEqual({
      kind: 'article',
      locale: 'en',
      slug: 'leaving-gmail',
    });
  });

  it('reads a categorised article from the shape of its URL', () => {
    expect(parseUrl(scheme, '/articles/c/javascript/styled-components')).toEqual(
      {
        kind: 'article',
        locale: 'en',
        category: 'javascript',
        slug: 'styled-components',
      },
    );
  });

  it('reads the blog home, its roll pages and a category roll', () => {
    expect(parseUrl(scheme, '/articles')).toEqual({
      kind: 'blog-home',
      locale: 'en',
      page: 1,
    });
    expect(parseUrl(scheme, '/articles/p/4')).toEqual({
      kind: 'blog-home',
      locale: 'en',
      page: 4,
    });
    expect(parseUrl(scheme, '/articles/c/web/p/2')).toEqual({
      kind: 'category',
      locale: 'en',
      category: 'web',
      page: 2,
    });
  });

  it('reads the locale prefix', () => {
    expect(parseUrl(scheme, '/l/fr/articles/c/web')).toEqual({
      kind: 'category',
      locale: 'fr',
      category: 'web',
      page: 1,
    });
  });

  // R-URLSCHEME-31: the parser knows the tag shape even though nothing serves it.
  it('reads a tag URL', () => {
    expect(parseUrl(scheme, '/articles/t/rxjs')).toEqual({
      kind: 'tag',
      locale: 'en',
      tag: 'rxjs',
      page: 1,
    });
  });

  it('claims nothing outside the content section', () => {
    expect(parseUrl(scheme, '/')).toBeUndefined();
    expect(parseUrl(scheme, '/pricing')).toBeUndefined();
    expect(parseUrl(scheme, '/l/fr')).toBeUndefined();
    expect(parseUrl(scheme, '/learn/blockchain')).toBeUndefined();
  });

  it('claims nothing under an unknown locale', () => {
    expect(parseUrl(scheme, '/l/de/articles')).toBeUndefined();
  });

  // R-URLSCHEME-11: a discriminant is never a slug, so these shapes read as nothing.
  it('refuses a reserved segment where a slug or a category is expected', () => {
    expect(parseUrl(scheme, '/articles/c')).toBeUndefined();
    expect(parseUrl(scheme, '/articles/p')).toBeUndefined();
    expect(parseUrl(scheme, '/articles/t')).toBeUndefined();
    expect(parseUrl(scheme, '/articles/c/p/2')).toBeUndefined();
    expect(parseUrl(scheme, '/articles/c/web/p')).toBeUndefined();
  });

  it('refuses a roll page that is not a positive integer', () => {
    expect(parseUrl(scheme, '/articles/p/0')).toBeUndefined();
    expect(parseUrl(scheme, '/articles/p/two')).toBeUndefined();
    expect(parseUrl(scheme, '/articles/p/2x')).toBeUndefined();
    expect(parseUrl(scheme, '/articles/p/-1')).toBeUndefined();
  });

  it('refuses a URL deeper than the scheme goes', () => {
    expect(
      parseUrl(scheme, '/articles/c/javascript/typescript/completes-with'),
    ).toBeUndefined();
    expect(parseUrl(scheme, '/articles/c/web/p/2/3')).toBeUndefined();
  });

  it('reads the non-canonical forms so a redirect target can be built from them', () => {
    expect(parseUrl(scheme, '/articles/p/1')).toEqual({
      kind: 'blog-home',
      locale: 'en',
      page: 1,
    });
    expect(parseUrl(scheme, '/l/en/articles/leaving-gmail')).toEqual({
      kind: 'article',
      locale: 'en',
      slug: 'leaving-gmail',
    });
    expect(parseUrl(scheme, '/articles/leaving-gmail/')).toEqual({
      kind: 'article',
      locale: 'en',
      slug: 'leaving-gmail',
    });
    expect(parseUrl(scheme, '/Articles/Leaving-Gmail')).toEqual({
      kind: 'article',
      locale: 'en',
      slug: 'leaving-gmail',
    });
  });

  it('is called with a path and rejects anything that is not one', () => {
    expect(parseUrl(scheme, 'articles')).toBeUndefined();
    expect(parseUrl(scheme, '')).toBeUndefined();
  });
});
