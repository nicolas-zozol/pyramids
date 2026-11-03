import { describe, expect, it } from 'vitest';
import { buildUrl } from './build-url.ts';
import type { UrlScheme } from './scheme.ts';

const scheme: UrlScheme = {
  contentRoot: 'articles',
  defaultLocale: 'en',
  otherLocales: ['fr'],
  rollSize: 12,
};

describe('buildUrl', () => {
  // R-ROOTLOCALE-01, BR-PYRAMID-14: the default Locale carries no marker.
  it('emits the landing of the default locale at the bare site root', () => {
    expect(buildUrl(scheme, { kind: 'landing', locale: 'en' })).toBe('/');
  });

  it('emits the landing of another locale under its prefix, with no trailing slash', () => {
    expect(buildUrl(scheme, { kind: 'landing', locale: 'fr' })).toBe('/fr');
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

  it('prefixes another locale and leaves the default one unmarked', () => {
    expect(buildUrl(scheme, { kind: 'blog-home', locale: 'fr', page: 2 })).toBe(
      '/fr/articles/p/2',
    );
    expect(buildUrl(scheme, { kind: 'blog-home', locale: 'en', page: 2 })).toBe(
      '/articles/p/2',
    );
  });

  it('never emits the default locale as a first segment, nor a trailing slash but on the site root', () => {
    const pages = [
      { kind: 'landing', locale: 'en' },
      { kind: 'blog-home', locale: 'en', page: 1 },
      { kind: 'category', locale: 'en', category: 'web', page: 3 },
      { kind: 'article', locale: 'en', slug: 'leaving-gmail' },
      { kind: 'landing', locale: 'fr' },
      { kind: 'article', locale: 'fr', category: 'web', slug: 'quitter-gmail' },
    ] as const;
    for (const page of pages) {
      const url = buildUrl(scheme, page);
      expect(url).not.toMatch(/^\/en(\/|$)/);
      expect(url === '/' || !url.endsWith('/'), url).toBe(true);
    }
  });

  it('emits no locale discriminant', () => {
    expect(
      buildUrl(scheme, { kind: 'article', locale: 'fr', slug: 'quitter-gmail' }),
    ).not.toMatch(/^\/l\//);
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
    ).toBe('/fr/articles/c/javascript/p/2');
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
    ).toBe('/fr/articles/t/rxjs/p/2');
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
