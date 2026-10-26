import { describe, expect, it } from 'vitest';
import { buildUrl } from './build-url.js';
import { urlSet } from './url-set.js';
import type { AddressableArticle, UrlScheme } from './scheme.js';

const scheme: UrlScheme = {
  contentRoot: 'articles',
  defaultLocale: 'en',
  otherLocales: ['fr'],
  rollSize: 12,
};

function roll(count: number, locale: string, category?: string): AddressableArticle[] {
  return Array.from({ length: count }, (_, i) => ({
    slug: `${category ?? 'plain'}-${locale}-${i + 1}`,
    locale,
    ...(category ? { category } : {}),
  }));
}

function urls(articles: readonly AddressableArticle[], from: UrlScheme = scheme): string[] {
  return urlSet(from, articles).map((page) => buildUrl(from, page));
}

describe('urlSet', () => {
  // AC-URLSCHEME-21.
  it('produces the blog home and its roll pages and no other roll URL', () => {
    const produced = urls(roll(30, 'en'));
    const rollUrls = produced.filter((url) => /^\/articles(\/p\/\d+)?$/.test(url));
    expect(rollUrls).toEqual(['/articles', '/articles/p/2', '/articles/p/3']);
  });

  it('produces no roll page on a corpus that fits one page', () => {
    const produced = urls(roll(11, 'en'));
    expect(produced.filter((url) => url.includes('/p/'))).toEqual([]);
    expect(produced).toContain('/articles');
  });

  it('produces the blog home of the default locale even on an empty corpus', () => {
    expect(urls([])).toEqual(['/articles']);
  });

  // AC-URLSCHEME-24: a non-default locale is served under its prefix and nowhere else.
  it('paginates each locale on its own article count', () => {
    const produced = urls([...roll(30, 'en'), ...roll(14, 'fr')]);
    expect(produced).toContain('/articles/p/3');
    expect(produced).toContain('/l/fr/articles');
    expect(produced).toContain('/l/fr/articles/p/2');
    expect(produced).not.toContain('/l/fr/articles/p/3');
  });

  it('produces no blog home for a locale no article claims', () => {
    expect(urls(roll(3, 'en'))).not.toContain('/l/fr/articles');
  });

  // AC-URLSCHEME-06 / R-URLSCHEME-6: the category set comes from the articles.
  it('produces one category page per category an article claims and no other', () => {
    const produced = urls([
      ...roll(3, 'en', 'javascript'),
      ...roll(1, 'en', 'privacy'),
    ]);
    const categoryUrls = produced.filter((url) => /^\/articles\/c\/[^/]+$/.test(url));
    expect(categoryUrls.sort()).toEqual([
      '/articles/c/javascript',
      '/articles/c/privacy',
    ]);
    expect(produced).not.toContain('/articles/c/solidity');
  });

  it('paginates a category roll on the count of that category alone', () => {
    const produced = urls([
      ...roll(25, 'en', 'javascript'),
      ...roll(1, 'en', 'typescript'),
    ]);
    expect(produced).toContain('/articles/c/javascript/p/2');
    expect(produced).toContain('/articles/c/javascript/p/3');
    expect(produced).not.toContain('/articles/c/javascript/p/4');
    expect(produced).toContain('/articles/c/typescript');
    expect(produced).not.toContain('/articles/c/typescript/p/2');
  });

  it('keeps a category of one locale out of another locale', () => {
    const produced = urls([...roll(2, 'en', 'web'), ...roll(2, 'fr', 'theory')]);
    expect(produced).toContain('/articles/c/web');
    expect(produced).toContain('/l/fr/articles/c/theory');
    expect(produced).not.toContain('/articles/c/theory');
    expect(produced).not.toContain('/l/fr/articles/c/web');
  });

  // AC-URLSCHEME-02 and 03.
  it('produces one URL per article, under its category when it claims one', () => {
    const produced = urls([
      { slug: 'styled-components', locale: 'en', category: 'javascript' },
      { slug: 'leaving-gmail', locale: 'en' },
      { slug: 'yield-farming-fr', locale: 'fr', category: 'blockchain' },
    ]);
    expect(produced).toContain('/articles/c/javascript/styled-components');
    expect(produced).toContain('/articles/leaving-gmail');
    expect(produced).toContain('/l/fr/articles/c/blockchain/yield-farming-fr');
  });

  // AC-URLSCHEME-45 / R-URLSCHEME-31.
  it('never produces a tag URL', () => {
    const produced = urlSet(scheme, roll(30, 'en', 'javascript'));
    expect(produced.some((page) => page.kind === 'tag')).toBe(false);
  });

  // The locale-prefixed landing has an empty param set until landing copy exists.
  it('never produces a landing URL', () => {
    const produced = urlSet(scheme, roll(5, 'en'));
    expect(produced.some((page) => page.kind === 'landing')).toBe(false);
  });

  it('is the only place a page count is computed from the roll size', () => {
    const atThree: UrlScheme = { ...scheme, rollSize: 3 };
    const produced = urls(roll(7, 'en'), atThree);
    expect(produced.filter((url) => /^\/articles(\/p\/\d+)?$/.test(url))).toEqual([
      '/articles',
      '/articles/p/2',
      '/articles/p/3',
    ]);
  });

  it('is deterministic and free of duplicates', () => {
    const articles = [...roll(30, 'en', 'javascript'), ...roll(14, 'fr'), ...roll(1, 'en')];
    const first = urls(articles);
    const second = urls([...articles].reverse());
    expect(new Set(first).size).toBe(first.length);
    expect([...first].sort()).toEqual([...second].sort());
  });
});
