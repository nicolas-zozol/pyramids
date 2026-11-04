import { beforeAll, describe, expect, it } from 'vitest';
import { Footer, Header } from '../chrome/index.ts';
import { localeRolls } from '../page-data/locale-rolls.ts';
import { pageCounterparts } from '../page-data/page-counterparts.ts';
import { rollPage } from '../page-data/roll-page.ts';
import type { RollPage } from '../page-data/index.ts';
import { contentUrls } from '../routing/content-urls.ts';
import { LOCALES, urlScheme } from '../routing/scheme.ts';
import {
  buildUrl,
  type PageUrl,
  type RollUrl,
} from '../routing/url-scheme/index.ts';
import {
  getCategoryLabel,
  getPageCopy,
  getSeoPyramidsConfig,
} from '../seopyramids.config.ts';
import { designSystemClassNames } from '../test-support/design-system-css.ts';
import {
  anchorsTo,
  classNames,
  hrefs,
  htmlText,
  readableTexts,
} from '../test-support/markup.ts';
import { renderInRouter } from '../test-support/render-in-router.tsx';
import { ListingPage, listingHead } from './index.ts';

const { contact } = getSeoPyramidsConfig();
const BRAND = ['💪', '🏗', 'Robusta Build'];

const isRoll = (page: PageUrl): page is RollUrl =>
  page.kind === 'blog-home' || page.kind === 'category';

/** A listing page as the prerender writes it: the chrome around it, on the real corpus. */
async function listingPage(url: RollUrl): Promise<string> {
  return renderInRouter(
    <>
      <Header locale={url.locale} counterparts={await pageCounterparts(url)} />
      <ListingPage page={await rollPage(url)} />
      <Footer
        locale={url.locale}
        rolls={await localeRolls({ locale: url.locale })}
      />
    </>,
    buildUrl(urlScheme, url),
  );
}

function stringsOf(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object' || value === null) return [];
  return Object.values(value).flatMap(stringsOf);
}

/** Every text the site supplies to a listing page: its page copy, its Category labels, the titles and dates of its posts, the other Locales' names, the contact, the brand. */
function suppliedTexts(locale: string, page: RollPage): Set<string> {
  const otherLocaleNames = LOCALES.filter((other) => other !== locale).map(
    (other) => getPageCopy(other).localeName,
  );
  return new Set(
    [
      ...stringsOf(getPageCopy(locale)),
      ...otherLocaleNames,
      contact.email,
      ...page.posts.flatMap((post) => [post.title, post.date]),
      ...BRAND,
    ].map(htmlText),
  );
}

const fixturePost = (n: number) => ({
  title: `Article ${n}`,
  href: `/articles/c/web/article-${n}`,
  tag: 'web',
  date: 'Dec 1, 2022',
});

const firstOfTwo: RollPage = {
  locale: 'en',
  posts: Array.from({ length: 12 }, (_, i) => fixturePost(i + 1)),
  nextUrl: '/articles/p/2',
};

const secondOfThree: RollPage = {
  locale: 'en',
  posts: Array.from({ length: 12 }, (_, i) => fixturePost(i + 13)),
  previousUrl: '/articles',
  nextUrl: '/articles/p/3',
};

const emptyBlogHome: RollPage = { locale: 'en', posts: [] };

const navOf = (html: string) => /<nav\b[\s\S]*?<\/nav>/.exec(html)?.[0] ?? '';
const mainOf = (html: string) =>
  /<main\b[\s\S]*?<\/main>/.exec(html)?.[0] ?? '';

let rolls: RollUrl[];
let pages: Map<RollUrl, string>;

beforeAll(async () => {
  rolls = (await contentUrls()).filter(isRoll);
  pages = new Map(
    await Promise.all(
      rolls.map(async (url) => [url, await listingPage(url)] as const),
    ),
  );
});

describe('ListingPage', () => {
  it('heads the blog home with the blog title of its Locale, and a Category roll with its label', async () => {
    const english = await renderInRouter(
      <ListingPage page={{ locale: 'en', posts: [] }} />,
    );
    const theory = await renderInRouter(
      <ListingPage page={{ locale: 'fr', category: 'theory', posts: [] }} />,
    );

    expect(/<h1[^>]*>([^<]*)<\/h1>/.exec(english)?.[1]).toBe(
      htmlText(getPageCopy('en').listing.blogTitle),
    );
    expect(/<h1[^>]*>([^<]*)<\/h1>/.exec(theory)?.[1]).toBe(
      htmlText(getCategoryLabel('fr', 'theory')),
    );
  });

  it('renders in one <main> the h1, then the roll by NotesPreview without eyebrow, title nor "all articles" link', async () => {
    const html = mainOf(
      await renderInRouter(<ListingPage page={firstOfTwo} />),
    );

    expect(html.indexOf('<h1')).toBeLessThan(html.indexOf('sk-notes-preview'));
    expect(html.match(/class="sk-notes-preview__post"/g)).toHaveLength(12);
    expect(html).not.toMatch(
      /<h2|sk-notes-preview__eyebrow|sk-notes-preview__all/,
    );
  });

  it('names each Category of a post by its label in the Locale of the page', async () => {
    const html = await renderInRouter(
      <ListingPage
        page={{
          locale: 'fr',
          posts: [
            {
              title: 'Quitter Gmail',
              href: '/fr/a',
              tag: 'privacy',
              date: '24 mai 2019',
            },
          ],
        }}
      />,
    );

    expect(html).toContain(`>${htmlText(getCategoryLabel('fr', 'privacy'))}<`);
    expect(html).not.toMatch(/>privacy</);
  });

  it('links the next page from the first one, in a nav named by the page copy', async () => {
    const { pagination } = getPageCopy('en').listing;
    const nav = navOf(await renderInRouter(<ListingPage page={firstOfTwo} />));

    expect(nav).toContain(`aria-label="${htmlText(pagination.navLabel)}"`);
    expect(hrefs(nav)).toEqual(['/articles/p/2']);
    expect(nav).toContain(`>${htmlText(pagination.olderLabel)}<`);
    expect(nav).not.toContain(htmlText(pagination.newerLabel));
  });

  it('links page 2 back to the first page without /p/, and on to page 3', async () => {
    const { pagination } = getPageCopy('en').listing;
    const nav = navOf(
      await renderInRouter(<ListingPage page={secondOfThree} />),
    );

    expect(hrefs(nav)).toEqual(['/articles', '/articles/p/3']);
    expect(anchorsTo(nav, '/articles')[0]).toBeDefined();
    expect(nav).toContain(`>${htmlText(pagination.newerLabel)}<`);
  });

  it('has no nav on a roll of one page, and shows only its title on an empty blog home', async () => {
    const empty = await renderInRouter(<ListingPage page={emptyBlogHome} />);

    expect(empty).not.toContain('<nav');
    expect(empty).not.toContain('sk-notes-preview__post');
    expect(readableTexts(mainOf(empty))).toEqual([
      htmlText(getPageCopy('en').listing.blogTitle),
    ]);
  });

  it('throws naming the Category and the Locale when the Locale has no label for the roll’s Category', () => {
    expect(() =>
      ListingPage({ page: { locale: 'es', category: 'web', posts: [] } }),
    ).toThrow(/"web"[\s\S]*"es"/);
  });

  it('throws naming the Category and the Locale when the Locale has no label for a post’s Category', () => {
    expect(() =>
      ListingPage({
        page: {
          locale: 'en',
          posts: [{ title: 't', href: '/a', tag: 'theory', date: 'd' }],
        },
      }),
    ).toThrow(/"theory"[\s\S]*"en"/);
  });
});

describe('the listing pages of the site', () => {
  it('are the 13 rolls of the URL set: 6 under /articles, 7 under /fr/articles, none under /es', () => {
    const urls = rolls.map((url) => buildUrl(urlScheme, url));

    expect(urls.filter((url) => url.startsWith('/articles'))).toHaveLength(6);
    expect(urls.filter((url) => url.startsWith('/fr/articles'))).toHaveLength(
      7,
    );
    expect(urls.filter((url) => url.startsWith('/es'))).toEqual([]);
    expect(urls).not.toContain('/articles/c/theory');
  });

  it('reach a reader with no text the site does not supply, header and footer included, no placeholder nor address', async () => {
    for (const [url, html] of pages) {
      const supplied = suppliedTexts(url.locale, await rollPage(url));

      expect(
        readableTexts(html).filter((text) => !supplied.has(text)),
        buildUrl(urlScheme, url),
      ).toEqual([]);
      expect(html).not.toMatch(/<code|placeholder/);
    }
  });

  it('list each post with a link to its article page, and its Category label on the blog home only', async () => {
    for (const [url, html] of pages) {
      const page = await rollPage(url);
      const main = mainOf(html);

      for (const post of page.posts)
        expect(anchorsTo(main, post.href ?? '')).toHaveLength(1);
      expect(main.match(/class="sk-tag/g)?.length ?? 0).toBe(
        url.kind === 'blog-home'
          ? page.posts.filter((post) => post.tag !== undefined).length
          : 0,
      );
    }
  });

  it('use class names of the design system and no other', async () => {
    const known = await designSystemClassNames();

    for (const html of pages.values())
      expect(classNames(html).filter((name) => !known.has(name))).toEqual([]);
  });

  it('style the h1 and the nav with values of the design system alone', async () => {
    const html = await renderInRouter(<ListingPage page={secondOfThree} />);
    const styles = [...mainOf(html).matchAll(/\sstyle="([^"]*)"/g)].map(
      ([, style]) => style,
    );

    expect(styles.length).toBeGreaterThan(0);
    for (const style of styles)
      for (const value of style
        .split(';')
        .map((rule) => rule.split(':')[1]?.trim()))
        if (value !== undefined)
          expect(value).toMatch(
            /^(var\(--[\w-]+\)( var\(--[\w-]+\))*|0|flex|wrap|space-between|auto)$/,
          );
  });
});

describe('listingHead', () => {
  const blogHome = (locale: string, page = 1): RollUrl => ({
    kind: 'blog-home',
    locale,
    page,
  });
  const category = (locale: string, slug: string, page = 1): RollUrl => ({
    kind: 'category',
    locale,
    category: slug,
    page,
  });
  const titleOf = (url: RollUrl) => listingHead(url).meta[0].title;
  const descriptionOf = (url: RollUrl) => listingHead(url).meta[1].content;

  it('gives the title then the description of the blog home model of its Locale', () => {
    for (const locale of ['en', 'fr']) {
      const { blogHome: model } = getPageCopy(locale).listing.head;

      expect(listingHead(blogHome(locale))).toEqual({
        meta: [
          { title: model.title },
          { name: 'description', content: model.description },
        ],
      });
    }
  });

  it('fills the Category model of its Locale with the label of the Category', () => {
    const label = getCategoryLabel('fr', 'privacy');

    expect(titleOf(category('fr', 'privacy'))).toContain(label);
    expect(descriptionOf(category('fr', 'privacy'))).toContain(label);
    expect(titleOf(category('fr', 'privacy'))).not.toContain('{category}');
  });

  it('appends the page suffix, its number filled, to the title and the description from page 2 on', () => {
    const { pageSuffix } = getPageCopy('en').listing.head;
    const suffix = pageSuffix.replace('{page}', '2');

    expect(titleOf(blogHome('en', 2))).toBe(
      `${titleOf(blogHome('en'))}${suffix}`,
    );
    expect(descriptionOf(category('en', 'web', 2))).toBe(
      `${descriptionOf(category('en', 'web'))}${suffix}`,
    );
    expect(titleOf(blogHome('en'))).not.toContain(suffix);
  });

  it('gives no two listing pages, nor a listing page and another page of the site, the same title or description, /articles and /fr/articles included', () => {
    const withSecondPages = [
      ...rolls,
      ...rolls.map((url) => ({ ...url, page: 2 })),
    ];
    const otherHeads = LOCALES.flatMap((locale) => {
      const { head, landing } = getPageCopy(locale);
      return [head, landing.head];
    });

    for (const [ofListing, ofOthers] of [
      [withSecondPages.map(titleOf), otherHeads.map((head) => head.title)],
      [
        withSecondPages.map(descriptionOf),
        otherHeads.map((head) => head.description),
      ],
    ]) {
      expect(new Set(ofListing).size).toBe(ofListing.length);
      expect(ofListing.filter((text) => ofOthers.includes(text))).toEqual([]);
    }
    expect(titleOf(blogHome('en'))).not.toBe(titleOf(blogHome('fr')));
  });

  it('throws naming the Category and the Locale when the Locale has no label for it', () => {
    expect(() => listingHead(category('en', 'theory'))).toThrow(
      /"theory"[\s\S]*"en"/,
    );
  });
});
