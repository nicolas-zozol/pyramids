import { describe, it, expect } from 'vitest';
import { pageParser, routeParsersForSpecs } from './masala-route-parser';
const { categoriesParser, slugParser } = routeParsersForSpecs;
import { Streams } from '@masala/parser';

const allCategories = [
  ['blockchain'],
  ['blockchain', 'security'],
  ['seo'],
  ['react'],
];

describe('page parser', () => {
  it('should parse a valid page pattern "/page/2"', () => {
    const result = pageParser.parse(Streams.ofString('/page/2'));
    expect(result.isAccepted()).toBe(true);
    if (result.isAccepted()) {
      // result.value is { page: number }
      expect(result.value).toEqual({ page: 2 });
    }
  });

  it('should fail if the page number is not an integer, e.g. "page/abc"', () => {
    const result = pageParser.parse(Streams.ofString('page/abc'));
    expect(result.isAccepted()).toBe(false);
  });

  it('should fail if no slash after "page", e.g. "page123"', () => {
    const result = pageParser.parse(Streams.ofString('page123'));
    expect(result.isAccepted()).toBe(false);
  });

  it('should parse only one integer; extra text should fail, e.g. "page/2/xyz"', () => {
    const result = pageParser.parse(Streams.ofString('page/2/xyz'));
    expect(result.isAccepted()).toBe(false);
  });
});

describe('slug parser', () => {
  it('should parse a valid post slug like "/s/what-is-blockchain"', () => {
    const result = slugParser.parse(Streams.ofString('/s/what-is-blockchain'));
    expect(result.isAccepted()).toBe(true);
    if (result.isAccepted()) {
      expect(result.value).toEqual({ slug: 'what-is-blockchain' });
    }
  });

  it('should fail if there is no slug after "p/"', () => {
    const result = slugParser.parse(Streams.ofString('/s/'));
    expect(result.isAccepted()).toBe(false);
  });

  it('should fail if we do not have "/s/" prefix, e.g. "swhat-is-blockchain"', () => {
    const result = slugParser.parse(Streams.ofString('swhat-is-blockchain'));
    expect(result.isAccepted()).toBe(false);
  });

  it('should parse if the slug has multiple dashes "/s/long-post-name-test"', () => {
    const result = slugParser.parse(Streams.ofString('/s/long-post-name-test'));
    expect(result.isAccepted()).toBe(true);
    if (result.isAccepted()) {
      expect(result.value).toEqual({ slug: 'long-post-name-test' });
    }
  });
});

describe('categories parser', () => {
  it('should parse a single category "blockchain"', () => {
    const result = categoriesParser(allCategories).parse(
      Streams.ofString('/blockchain'),
    );
    expect(result.isAccepted()).toBe(true);
    if (result.isAccepted()) {
      expect(result.value).toEqual({ categories: ['blockchain'] });
    }
  });

  it('should parse multiple categories "blockchain/security"', () => {
    const result = categoriesParser(allCategories).parse(
      Streams.ofString('/blockchain/security'),
    );
    expect(result.isAccepted()).toBe(true);
    if (result.isAccepted()) {
      expect(result.value).toEqual({ categories: ['blockchain', 'security'] });
    }
  });

  it('should not fail on empty string (no category)', () => {
    const result = categoriesParser(allCategories).parse(Streams.ofString(''));
    expect(result.isAccepted()).toBe(false);
    expect(result.value).toEqual(undefined);
  });

  it('should be false if category dont exist', () => {
    const result = categoriesParser(allCategories).parse(
      Streams.ofString('/blockchain/security/extra'),
    );

    expect(result.isAccepted()).toBe(true);
    expect(result.offset).toBe('/blockchain/security'.length);
  });
});
