// parseUrl.test.ts
import { describe, it, expect } from 'vitest';
import { parseUrl, ParseResult } from './parse-url'; // adjust import path

describe('parseUrl', () => {
  const home = '/learn';
  const defaultLanguage = 'en';
  const otherLanguages = ['fr'];
  const allCategories = [
    ['blockchain'],
    ['blockchain', 'security'],
    ['seo'],
    ['react'],
  ];

  /**
   * Helper function for quick testing.
   */
  function testRoute(url: string, expected: ParseResult | undefined) {
    const result = parseUrl(
      url,
      home,
      defaultLanguage,
      otherLanguages,
      allCategories,
    );
    expect(result).toEqual(expected);
  }

  it('should return undefined for random / portfolio route', () => {
    testRoute('/portfolio', undefined);
  });

  it('should parse the blog home (default locale, no page)', () => {
    testRoute('/learn', {
      type: 'BLOG_ROLL',
      isDefaultLocale: true,
      locale: 'en',
      page: 1,
    });
  });

  it('should parse second page of the blog home', () => {
    testRoute('/learn/page/2', {
      type: 'BLOG_ROLL',
      isDefaultLocale: true,
      locale: 'en',
      page: 2,
    });
  });

  it('should parse the blog home in French', () => {
    testRoute('/learn/fr', {
      type: 'BLOG_ROLL',
      isDefaultLocale: false,
      locale: 'fr',
      page: 1,
    });
  });

  it('should parse category page (e.g. /learn/blockchain)', () => {
    testRoute('/learn/blockchain', {
      type: 'CATEGORY',
      isDefaultLocale: true,
      locale: 'en',
      categories: ['blockchain'],
      page: 1,
    });
  });

  it('should parse a paginated category page (e.g. /learn/blockchain/page/2)', () => {
    testRoute('/learn/blockchain/page/2', {
      type: 'CATEGORY',
      isDefaultLocale: true,
      locale: 'en',
      categories: ['blockchain'],
      slug: undefined,
      page: 2,
    });
  });

  it('should parse a blog post with slug (e.g. /learn/blockchain/s/what-is-blockchain)', () => {
    testRoute('/learn/blockchain/s/what-is-blockchain', {
      type: 'POST',
      isDefaultLocale: true,
      locale: 'en',
      categories: ['blockchain'],
      slug: 'what-is-blockchain',
      page: undefined,
    });
  });

  it('should parse French category page (e.g. /learn/fr/blockchain)', () => {
    testRoute('/learn/fr/blockchain', {
      type: 'CATEGORY',
      isDefaultLocale: false,
      locale: 'fr',
      categories: ['blockchain'],
      page: 1,
    });
  });

  it('should parse French paginated category page (e.g. /learn/fr/blockchain/page/2)', () => {
    testRoute('/learn/fr/blockchain/page/2', {
      type: 'CATEGORY',
      isDefaultLocale: false,
      locale: 'fr',
      categories: ['blockchain'],
      slug: undefined,
      page: 2,
    });
  });

  it('should parse French blog post (e.g. /learn/fr/blockchain/s/voici-la-blockchain)', () => {
    testRoute('/learn/fr/blockchain/s/voici-la-blockchain', {
      type: 'POST',
      isDefaultLocale: false,
      locale: 'fr',
      categories: ['blockchain'],
      slug: 'voici-la-blockchain',
      page: undefined,
    });
  });

  it('should parse multiple categories (e.g. /learn/blockchain/security)', () => {
    testRoute('/learn/blockchain/security', {
      type: 'CATEGORY',
      isDefaultLocale: true,
      locale: 'en',
      categories: ['blockchain', 'security'],
      page: 1,
    });
  });

  it('should parse multiple categories with pagination (e.g. /learn/blockchain/security/page/2)', () => {
    testRoute('/learn/blockchain/security/page/2', {
      type: 'CATEGORY',
      isDefaultLocale: true,
      locale: 'en',
      categories: ['blockchain', 'security'],
      slug: undefined,
      page: 2,
    });
  });

  it('should return undefined if using unknown locale (e.g. /learn/es/blockchain)', () => {
    testRoute('/learn/es/blockchain', undefined);
  });

  it('should return undefined if invalid page param (e.g. /learn/blockchain/page/two)', () => {
    testRoute('/learn/blockchain/page/two', undefined);
  });

  it('should return undefined if no slug after /s/ (e.g. /learn/blockchain/s/)', () => {
    testRoute('/learn/blockchain/s/', undefined);
  });

  it('should return undefined if user attempts both slug + pagination (e.g. /learn/blockchain/s/what-is-blockchain/page/2)', () => {
    testRoute('/learn/blockchain/s/what-is-blockchain/page/2', undefined);
  });

  it('should return undefined for any unknown route beyond known categories', () => {
    testRoute('/learn/somethingelse', undefined);
  });
});
