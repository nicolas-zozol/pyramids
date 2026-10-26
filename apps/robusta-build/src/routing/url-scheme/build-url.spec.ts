import { describe, expect, it } from 'vitest';
import { buildUrl } from './build-url.js';
import type { UrlScheme } from './scheme.js';

const scheme: UrlScheme = {
  contentRoot: 'articles',
  defaultLocale: 'en',
  otherLocales: ['fr'],
  rollSize: 12,
};

describe('buildUrl', () => {
  it('emits the bare site root for the default-locale landing', () => {
    expect(buildUrl(scheme, { kind: 'landing', locale: 'en' })).toBe('/');
  });

  it('prefixes the landing of another locale', () => {
    expect(buildUrl(scheme, { kind: 'landing', locale: 'fr' })).toBe('/l/fr');
  });

  // R-URLSCHEME-8: page one is the roll's own URL, never /p/1.
  it('emits the bare roll URL for page one of the blog home', () => {
    expect(buildUrl(scheme, { kind: 'blog-home', locale: 'en', page: 1 })).toBe(
      '/articles',
    );
  });

  it('emits the roll-page discriminant from page two', () => {
    expect(buildUrl(scheme, { kind: 'blog-home', locale: 'en', page: 3 })).toBe(
      '/articles/p/3',
    );
  });

  // R-URLSCHEME-9: the default locale carries no marker.
  it('prefixes a non-default locale and nothing else', () => {
    expect(buildUrl(scheme, { kind: 'blog-home', locale: 'fr', page: 2 })).toBe(
      '/l/fr/articles/p/2',
    );
  });

  it('emits a category page under the category discriminant', () => {
    expect(
      buildUrl(scheme, {
        kind: 'category',
        locale: 'en',
        category: 'javascript',
        page: 1,
      }),
    ).toBe('/articles/c/javascript');
  });

  it('paginates a category roll from page two', () => {
    expect(
      buildUrl(scheme, {
        kind: 'category',
        locale: 'fr',
        category: 'javascript',
        page: 2,
      }),
    ).toBe('/l/fr/articles/c/javascript/p/2');
  });

  // AC-URLSCHEME-02 / R-URLSCHEME-3.
  it('addresses an article carrying a category under that category', () => {
    expect(
      buildUrl(scheme, {
        kind: 'article',
        locale: 'en',
        category: 'javascript',
        slug: 'styled-components',
      }),
    ).toBe('/articles/c/javascript/styled-components');
  });

  // AC-URLSCHEME-03: the content root never appears twice.
  it('addresses an article carrying no category directly under the content root', () => {
    expect(
      buildUrl(scheme, { kind: 'article', locale: 'en', slug: 'leaving-gmail' }),
    ).toBe('/articles/leaving-gmail');
  });

  // AC-URLSCHEME-45 / R-URLSCHEME-31: the shape is known, nothing is built from it.
  it('knows the shape of a tag URL', () => {
    expect(
      buildUrl(scheme, { kind: 'tag', locale: 'en', tag: 'rxjs', page: 1 }),
    ).toBe('/articles/t/rxjs');
    expect(
      buildUrl(scheme, { kind: 'tag', locale: 'fr', tag: 'rxjs', page: 2 }),
    ).toBe('/l/fr/articles/t/rxjs/p/2');
  });

  it('refuses a page number below one rather than emitting a non-canonical form', () => {
    expect(() =>
      buildUrl(scheme, { kind: 'blog-home', locale: 'en', page: 0 }),
    ).toThrow();
  });

  it('respects a content root other than the robusta one', () => {
    const spots: UrlScheme = { ...scheme, contentRoot: 'spots' };
    expect(buildUrl(spots, { kind: 'blog-home', locale: 'en', page: 2 })).toBe(
      '/spots/p/2',
    );
  });
});
