import { describe, expect, it } from 'vitest';
import { localeRequest, rollUrl } from './validators.ts';

describe('rollUrl', () => {
  it('passes a blog home or a Category page at a whole page', () => {
    expect(rollUrl({ kind: 'blog-home', locale: 'en', page: 2 })).toEqual({
      kind: 'blog-home',
      locale: 'en',
      page: 2,
    });
    expect(
      rollUrl({ kind: 'category', locale: 'fr', category: 'theory', page: 1 }),
    ).toEqual({ kind: 'category', locale: 'fr', category: 'theory', page: 1 });
  });

  it('refuses an input that is not the URL of a roll page at a whole page', () => {
    for (const input of [
      undefined,
      { kind: 'article', locale: 'en', slug: 'leaving-gmail' },
      { kind: 'landing', locale: 'en' },
      { kind: 'blog-home', locale: 'en', page: Number('abc') },
      { kind: 'blog-home', locale: 'en', page: 1.5 },
      { kind: 'blog-home', page: 1 },
      { kind: 'category', locale: 'en', page: 1 },
    ])
      expect(() => rollUrl(input as never), JSON.stringify(input)).toThrow(
        /roll/,
      );
  });
});

describe('localeRequest', () => {
  it('passes a Locale', () => {
    expect(localeRequest({ locale: 'fr' })).toEqual({ locale: 'fr' });
  });

  it('refuses an input whose locale is not a string', () => {
    for (const input of [undefined, {}, { locale: 3 }])
      expect(() => localeRequest(input as never)).toThrow(/locale/);
  });
});
