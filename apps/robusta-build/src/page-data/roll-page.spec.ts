import { describe, expect, expectTypeOf, it } from 'vitest';
import type { ArticleIndexEntry } from '../content/article-index.ts';
import { ROLL_SIZE, urlScheme } from '../routing/scheme.ts';
import {
  urlSet,
  type PageUrl,
  type RollUrl,
} from '../routing/url-scheme/index.ts';
import { rollPage, rollPageOf } from './roll-page.ts';

/** `count` articles of one Locale and Category, newest first as the index gives them, one a month from December 2022 backwards. */
function articles(
  count: number,
  locale = 'en',
  category: string | null = 'web',
): ArticleIndexEntry[] {
  return Array.from({ length: count }, (_, i) => {
    const month = 12 - (i % 12);
    const year = 2022 - Math.floor(i / 12);
    const slug = `${category ?? 'uncategorized'}-${locale}-${i + 1}`;
    return {
      path: `${category ?? ''}/${slug}.md`,
      slug,
      locale,
      ...(category === null ? {} : { category }),
      title: `Article ${i + 1}`,
      date: `${year}-${String(month).padStart(2, '0')}-01`,
      author: 'Nicolas Zozol',
      tags: [],
      excerpt: 'An excerpt.',
    };
  });
}

const blogHome = (page: number, locale = 'en'): RollUrl => ({
  kind: 'blog-home',
  locale,
  page,
});

const categoryRoll = (
  category: string,
  page: number,
  locale = 'en',
): RollUrl => ({
  kind: 'category',
  locale,
  category,
  page,
});

function pageOf(page: RollUrl, index: readonly ArticleIndexEntry[]) {
  return rollPageOf(page, index, urlSet(urlScheme, index));
}

describe('RollUrl', () => {
  it('is the PageUrl of a blog home or of a Category page', () => {
    expectTypeOf<RollUrl>().toEqualTypeOf<
      Extract<PageUrl, { kind: 'blog-home' | 'category' }>
    >();
  });
});

/**
 * A roll of 25 English web articles at the roll size of 12.
 *
 * Scenario of reference:
 * - the blog home and the web Category each have three pages: 12, 12, then 1
 * - page 2 links back to the first page, without /p/, and on to /p/3
 * - page 3 has no next page
 */
describe('rollPageOf on a roll of 25 articles', () => {
  const index = articles(25);

  it('slices the roll by the roll size, newest first', () => {
    const [first, second, third] = [1, 2, 3].map((n) =>
      pageOf(blogHome(n), index),
    );

    expect(ROLL_SIZE).toBe(12);
    expect(first.posts.map((post) => post.title)).toEqual(
      index.slice(0, 12).map((article) => article.title),
    );
    expect(second.posts.map((post) => post.title)).toEqual(
      index.slice(12, 24).map((article) => article.title),
    );
    expect(third.posts.map((post) => post.title)).toEqual(['Article 25']);
  });

  it('links each page to its neighbours, page 2 back to the first page without /p/', () => {
    expect(pageOf(blogHome(1), index)).toMatchObject({
      nextUrl: '/articles/p/2',
    });
    expect(pageOf(blogHome(1), index)).not.toHaveProperty('previousUrl');
    expect(pageOf(blogHome(2), index)).toMatchObject({
      previousUrl: '/articles',
      nextUrl: '/articles/p/3',
    });
    expect(pageOf(blogHome(3), index)).toMatchObject({
      previousUrl: '/articles/p/2',
    });
    expect(pageOf(blogHome(3), index)).not.toHaveProperty('nextUrl');
  });

  it('pages a Category roll the same way, under its own address', () => {
    expect(pageOf(categoryRoll('web', 2), index)).toMatchObject({
      locale: 'en',
      category: 'web',
      previousUrl: '/articles/c/web',
      nextUrl: '/articles/c/web/p/3',
    });
  });

  it('builds the French neighbours under /fr', () => {
    const french = articles(13, 'fr');

    expect(pageOf(blogHome(1, 'fr'), french).nextUrl).toBe('/fr/articles/p/2');
    expect(pageOf(blogHome(2, 'fr'), french).previousUrl).toBe('/fr/articles');
  });

  it('throws naming the page when the URL set does not hold it: page one explicit, or beyond the last', () => {
    expect(() => pageOf(blogHome(4), index)).toThrow(
      /blog-home[\s\S]*"page":4/,
    );
    expect(() => pageOf(blogHome(0), index)).toThrow(/"page":0/);
    expect(() => pageOf(categoryRoll('css', 1), index)).toThrow(/"css"/);
  });
});

describe('rollPageOf on a roll of 12 articles or fewer', () => {
  const index = articles(12);

  it('has one page, with no neighbour, and no page 2 in the URL set', () => {
    const only = pageOf(blogHome(1), index);

    expect(only.posts).toHaveLength(12);
    expect(only).not.toHaveProperty('previousUrl');
    expect(only).not.toHaveProperty('nextUrl');
    expect(() => pageOf(blogHome(2), index)).toThrow(/"page":2/);
  });
});

describe('the posts of a roll page', () => {
  it('carry the title, the canonical article URL and the date with its year, written in the Locale of the page', () => {
    const [english] = pageOf(blogHome(1), articles(1)).posts;
    const [french] = pageOf(blogHome(1, 'fr'), articles(1, 'fr')).posts;

    expect(english).toEqual({
      title: 'Article 1',
      href: '/articles/c/web/web-en-1',
      tag: 'web',
      date: 'Dec 1, 2022',
    });
    expect(french).toEqual({
      title: 'Article 1',
      href: '/fr/articles/c/web/web-fr-1',
      tag: 'web',
      date: '1 déc. 2022',
    });
  });

  it('write the year of each date, articles from 2019 to 2022 included', () => {
    const years = pageOf(blogHome(1), articles(40)).posts;

    expect(years.map((post) => post.date.slice(-4))).toEqual([
      ...Array(12).fill('2022'),
    ]);
    expect(
      pageOf(blogHome(4), articles(40)).posts.map((post) => post.date),
    ).toEqual(['Dec 1, 2019', 'Nov 1, 2019', 'Oct 1, 2019', 'Sep 1, 2019']);
  });

  it('are tagged with the slug of their Category on a blog home, and not on a Category roll', () => {
    const index = articles(2);

    expect(pageOf(blogHome(1), index).posts.map((post) => post.tag)).toEqual([
      'web',
      'web',
    ]);
    expect(
      pageOf(categoryRoll('web', 1), index).posts.every(
        (post) => !('tag' in post),
      ),
    ).toBe(true);
  });
});

describe('the articles of a roll', () => {
  const english = articles(2, 'en', 'web');
  const french = articles(2, 'fr', 'theory');
  const untagged = articles(1, 'en', null);
  const index = [...english, ...french, ...untagged];

  it('are those of the page’s Locale alone', () => {
    expect(pageOf(blogHome(1), index).posts.map((post) => post.href)).toEqual([
      '/articles/c/web/web-en-1',
      '/articles/c/web/web-en-2',
      '/articles/uncategorized-en-1',
    ]);
  });

  it('are those claiming the Category on a Category roll, an article without Category on none', () => {
    expect(
      pageOf(categoryRoll('web', 1), index).posts.map((post) => post.href),
    ).toEqual(['/articles/c/web/web-en-1', '/articles/c/web/web-en-2']);
  });

  it('leave an article without Category on its blog home untagged', () => {
    const post = pageOf(blogHome(1), index).posts.find((p) =>
      p.href?.endsWith('/uncategorized-en-1'),
    );

    expect(post).toBeDefined();
    expect(post).not.toHaveProperty('tag');
  });

  it('keep a stale translation, still published, in the rolls of its Locale', () => {
    const [translation] = articles(1, 'fr', 'web');
    const stale: ArticleIndexEntry = {
      ...translation,
      translationId: 'a-pair',
      original: { locale: 'en', fingerprint: 'an-old-fingerprint' },
    };

    expect(
      pageOf(categoryRoll('web', 1, 'fr'), [stale]).posts.map(
        (post) => post.href,
      ),
    ).toEqual(['/fr/articles/c/web/web-fr-1']);
  });

  it('give theory a roll under /fr only', () => {
    expect(() => pageOf(categoryRoll('theory', 1, 'en'), index)).toThrow(
      /"theory"/,
    );
    expect(pageOf(categoryRoll('theory', 1, 'fr'), index).posts).toHaveLength(
      2,
    );
  });

  it('give the default Locale an empty blog home when it publishes nothing', () => {
    expect(pageOf(blogHome(1), french)).toEqual({
      locale: 'en',
      indexable: false,
      versions: [],
      posts: [],
    });
  });

  it('give a Locale other than the default one no blog home when it publishes nothing', () => {
    expect(() => pageOf(blogHome(1, 'es'), index)).toThrow(/"es"/);
  });

  it('give the first Spanish article a blog home and a Category page under /es', () => {
    const spanish = articles(1, 'es', 'web');

    expect(pageOf(blogHome(1, 'es'), spanish).posts).toHaveLength(1);
    expect(pageOf(categoryRoll('web', 1, 'es'), spanish).posts).toHaveLength(1);
  });

  it('lose a Category whose only article stops being published, its page with it', () => {
    const withoutTheory = index.filter(
      (article) => article.category !== 'theory',
    );

    expect(() =>
      pageOf(categoryRoll('theory', 1, 'fr'), withoutTheory),
    ).toThrow(/"theory"/);
  });
});

/** `getRollPage`'s handler, on the site's own corpus. */
describe('rollPage', () => {
  it('lists the eight English articles on /articles, newest first, each tagged with its Category', async () => {
    const page = await rollPage(blogHome(1));

    expect(page.posts).toHaveLength(8);
    expect(page.posts[0]).toEqual({
      title: 'Ledger versus Metamask',
      href: '/articles/c/blockchain/ledger-versus-metamask',
      tag: 'blockchain',
      date: 'Jan 20, 2022',
    });
    expect(page.posts.at(-1)?.date).toBe('May 24, 2019');
    expect(page).not.toHaveProperty('nextUrl');
  });

  it('lists the French theory article on /fr/articles/c/theory, untagged', async () => {
    const page = await rollPage(categoryRoll('theory', 1, 'fr'));

    expect(page).toEqual({
      locale: 'fr',
      category: 'theory',
      indexable: true,
      versions: [],
      posts: [
        {
          title: expect.stringMatching(/^Quel langage/),
          href: '/fr/articles/c/theory/quel-langage-pour-progresser-dans-sa-carriere',
          date: '13 déc. 2020',
        },
      ],
    });
  });

  it('leaves out agence-web-ou-freelance, which is not published', async () => {
    const page = await rollPage(categoryRoll('web', 1, 'fr'));

    expect(page.posts.map((post) => post.href)).toEqual([
      '/fr/articles/c/web/domotique-facile-avec-sonoff-et-javascript',
    ]);
  });

  it('throws naming /articles/c/theory, which the URL set does not hold', async () => {
    await expect(rollPage(categoryRoll('theory', 1))).rejects.toThrow(
      /"theory"/,
    );
  });
});

// R-SEOEXCELLENCE-22, AC-SEOEXCELLENCE-7: what a roll page declares of itself.
describe('the declaration of a roll page', () => {
  const both = [...articles(13, 'fr'), ...articles(13, 'en')];

  it('is indexable when it lists an article, a Category of one article included', () => {
    expect(pageOf(blogHome(1), both).indexable).toBe(true);
    expect(
      pageOf(categoryRoll('privacy', 1), articles(1, 'en', 'privacy'))
        .indexable,
    ).toBe(true);
  });

  it('is not indexable on an empty en blog home', () => {
    expect(pageOf(blogHome(1), articles(2, 'fr')).indexable).toBe(false);
  });

  it('gives page 2 the page 2 of the same roll in the other Locale, never its first page', () => {
    expect(pageOf(blogHome(2, 'fr'), both).versions).toEqual([
      { locale: 'en', url: '/articles/p/2' },
    ]);
    expect(pageOf(categoryRoll('web', 2), both).versions).toEqual([
      { locale: 'fr', url: '/fr/articles/c/web/p/2' },
    ]);
  });

  it('gives page 2 no version when the other Locale has a single page', () => {
    const index = [...articles(13, 'fr'), ...articles(1, 'en')];

    expect(pageOf(blogHome(2, 'fr'), index).versions).toEqual([]);
  });

  it('names no version that is not indexable, the empty en blog home included', () => {
    const index = articles(2, 'fr');

    expect(pageOf(blogHome(1, 'fr'), index).versions).toEqual([]);
  });

  it('carries the versions of the corpus pages that have one', async () => {
    expect((await rollPage(blogHome(1, 'fr'))).versions).toEqual([
      { locale: 'en', url: '/articles' },
    ]);
    expect((await rollPage(categoryRoll('theory', 1, 'fr'))).versions).toEqual(
      [],
    );
  });
});
