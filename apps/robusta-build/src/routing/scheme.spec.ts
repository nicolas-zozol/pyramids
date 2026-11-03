import { describe, expect, it } from 'vitest';
import { corpus } from '../content/corpus.ts';
import { LOCALES, urlScheme } from './scheme.ts';

/** The first segments a Locale must never take: the content root and the first segment of the asset root. */
function firstSegmentsTakenBy(
  contentRoot: string,
  assetUrlPrefix: string,
): string[] {
  const [assetSegment] = assetUrlPrefix
    .split('/')
    .filter((segment) => segment !== '');
  return [contentRoot, assetSegment];
}

function collidingLocales(
  locales: readonly string[],
  contentRoot: string,
  assetUrlPrefix: string,
): string[] {
  const taken = firstSegmentsTakenBy(contentRoot, assetUrlPrefix);
  return locales.filter((locale) => taken.includes(locale));
}

// R-ROOTLOCALE-04, BR-PYRAMID-1: with no Locale discriminant, a first segment
// is a Locale, the content root or the asset root, and never two of them.
describe('the first segment of a site URL', () => {
  it('names the content root and the asset root, which no Locale may take', () => {
    expect(firstSegmentsTakenBy('articles', '/article-images')).toEqual([
      'articles',
      'article-images',
    ]);
    expect(
      collidingLocales(['en', 'articles'], 'articles', '/article-images'),
    ).toEqual(['articles']);
    expect(
      collidingLocales(['en', 'article-images'], 'articles', '/article-images'),
    ).toEqual(['article-images']);
  });

  it('is never a Locale of the site that equals its content root or its asset root', () => {
    const assetUrlPrefix = corpus.assets?.urlPrefix;

    expect(assetUrlPrefix).toBe('/article-images');
    expect(
      collidingLocales(LOCALES, urlScheme.contentRoot, assetUrlPrefix ?? ''),
    ).toEqual([]);
  });
});
