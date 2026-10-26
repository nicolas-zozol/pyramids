import { describe, expect, it } from 'vitest';
import { validateArticles } from './validate-articles.js';
import type { AddressableArticle, UrlScheme } from './scheme.js';

const scheme: UrlScheme = {
  contentRoot: 'articles',
  defaultLocale: 'en',
  otherLocales: ['fr'],
  rollSize: 12,
};

const sound: AddressableArticle[] = [
  { slug: 'leaving-gmail', locale: 'en' },
  { slug: 'styled-components', locale: 'en', category: 'javascript' },
  { slug: 'quel-second-langage', locale: 'fr', category: 'theory' },
];

describe('validateArticles', () => {
  it('accepts a sound corpus', () => {
    expect(validateArticles(scheme, sound)).toEqual([]);
  });

  // AC-URLSCHEME-04 / R-URLSCHEME-11.
  it.each(['l', 'c', 'p', 't'])(
    'refuses %s as a slug and as a category',
    (reserved) => {
      expect(validateArticles(scheme, [{ slug: reserved, locale: 'en' }])).toEqual([
        { code: 'reserved-segment', segment: reserved, slug: reserved },
      ]);
      expect(
        validateArticles(scheme, [{ slug: 'ok', locale: 'en', category: reserved }]),
      ).toEqual([{ code: 'reserved-segment', segment: reserved, slug: 'ok' }]);
    },
  );

  // AC-URLSCHEME-05 / R-URLSCHEME-12.
  it('refuses two articles of the same locale sharing a slug', () => {
    const violations = validateArticles(scheme, [
      { slug: 'completes-with', locale: 'en', category: 'typescript' },
      { slug: 'completes-with', locale: 'en', category: 'javascript' },
    ]);
    expect(violations).toEqual([
      { code: 'duplicate-slug', slug: 'completes-with', locale: 'en' },
    ]);
  });

  it('accepts the same slug in two locales', () => {
    expect(
      validateArticles(scheme, [
        { slug: 'yield-farming', locale: 'en', category: 'blockchain' },
        { slug: 'yield-farming', locale: 'fr', category: 'blockchain' },
      ]),
    ).toEqual([]);
  });

  // R-URLSCHEME-4: a category is exactly one segment.
  it('refuses a nested category', () => {
    expect(
      validateArticles(scheme, [
        { slug: 'completes-with', locale: 'en', category: 'javascript/typescript' },
      ]),
    ).toEqual([
      {
        code: 'nested-category',
        category: 'javascript/typescript',
        slug: 'completes-with',
      },
    ]);
  });

  it('refuses a locale the scheme does not know', () => {
    expect(validateArticles(scheme, [{ slug: 'hallo', locale: 'de' }])).toEqual([
      { code: 'unknown-locale', locale: 'de', slug: 'hallo' },
    ]);
  });

  it('accepts the default locale and every other locale', () => {
    expect(
      validateArticles(scheme, [
        { slug: 'one', locale: 'en' },
        { slug: 'two', locale: 'fr' },
      ]),
    ).toEqual([]);
  });

  // Slugs are lowercase ASCII, stated so the first accented French slug does not
  // decide it by accident.
  it.each([
    'Leaving-Gmail',
    'quel-second-langage-carrière',
    'leaving_gmail',
    'leaving gmail',
    '-leading',
    'trailing-',
    'double--hyphen',
    '',
  ])('refuses the non-canonical slug %s', (slug) => {
    const violations = validateArticles(scheme, [{ slug, locale: 'en' }]);
    expect(violations).toContainEqual({
      code: 'non-canonical-segment',
      segment: slug,
      slug,
    });
  });

  it('refuses a non-canonical category', () => {
    expect(
      validateArticles(scheme, [{ slug: 'ok', locale: 'en', category: 'JavaScript' }]),
    ).toContainEqual({
      code: 'non-canonical-segment',
      segment: 'JavaScript',
      slug: 'ok',
    });
  });

  it('returns violations rather than throwing, and reports every one of them', () => {
    const violations = validateArticles(scheme, [
      { slug: 'p', locale: 'en' },
      { slug: 'ok', locale: 'de', category: 'a/b' },
    ]);
    expect(violations).toHaveLength(3);
    expect(violations.map((v) => v.code).sort()).toEqual([
      'nested-category',
      'reserved-segment',
      'unknown-locale',
    ]);
  });
});
