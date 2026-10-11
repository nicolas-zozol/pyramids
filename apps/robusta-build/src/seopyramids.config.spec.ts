import { describe, expect, it } from 'vitest';
import { urlScheme } from './routing/scheme.js';
import { getSeoPyramidsConfig } from './seopyramids.config.js';

describe('the Site configuration', () => {
  it('declares fr by default and en as the only other Locale', () => {
    const config = getSeoPyramidsConfig();

    expect(config.defaultLocale).toBe('fr');
    expect(config.otherLocales).toEqual(['en']);
  });

  it('reads its Locales from the scheme, at its root as in its blog configuration', () => {
    const config = getSeoPyramidsConfig();

    expect(urlScheme.defaultLocale).toBe('fr');
    expect(config.defaultLocale).toBe(urlScheme.defaultLocale);
    expect(config.otherLocales).toEqual(urlScheme.otherLocales);
    expect(config.blogConfig.defaultLocale).toBe(urlScheme.defaultLocale);
    expect(config.blogConfig.otherLocales).toEqual(urlScheme.otherLocales);
  });
});
