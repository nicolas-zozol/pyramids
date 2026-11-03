import { describe, expect, it } from 'vitest';
import { localeOfSegment } from './index.ts';
import type { UrlScheme } from './scheme.ts';

const scheme: UrlScheme = {
  contentRoot: 'articles',
  defaultLocale: 'en',
  otherLocales: ['fr', 'es'],
  rollSize: 12,
};

// R-ROOTLOCALE-03: the Locale an optional first route segment designates.
describe('localeOfSegment', () => {
  it('designates the default locale when the segment is absent', () => {
    expect(localeOfSegment(scheme, undefined)).toBe('en');
  });

  it('designates another locale of the scheme by its exact code', () => {
    expect(localeOfSegment(scheme, 'fr')).toBe('fr');
    expect(localeOfSegment(scheme, 'es')).toBe('es');
  });

  it('designates nothing when the segment marks the default locale', () => {
    expect(localeOfSegment(scheme, 'en')).toBeUndefined();
  });

  it('designates nothing for a segment naming no locale of the scheme', () => {
    expect(localeOfSegment(scheme, 'de')).toBeUndefined();
    expect(localeOfSegment(scheme, 'articles')).toBeUndefined();
    expect(localeOfSegment(scheme, '')).toBeUndefined();
  });

  it('is strict on case, the route table serving canonical forms only', () => {
    expect(localeOfSegment(scheme, 'FR')).toBeUndefined();
    expect(localeOfSegment(scheme, 'Es')).toBeUndefined();
  });
});
