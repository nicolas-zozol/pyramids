import { describe, expect, it } from 'vitest';
import type { ArticlePage } from '../page-data/index.ts';
import { articlePage } from '../page-data/article-page.ts';
import { getCategoryLabel, getPageCopy } from '../seopyramids.config.ts';
import type { HeadLink, HeadMeta, RouteHead } from '../seo/index.ts';
import { articleHead, articleTrail } from './index.ts';

const ORIGIN = 'https://www.robusta.build';

const contentOf = (meta: HeadMeta[], key: string) =>
  (
    meta.find(
      (tag) =>
        ('name' in tag && tag.name === key) ||
        ('property' in tag && tag.property === key),
    ) as { content?: string } | undefined
  )?.content;

const structuredData = (head: RouteHead): unknown[] =>
  head.scripts.map((script) => JSON.parse(script.children));

const hreflangs = (links: HeadLink[]) =>
  links.filter((link) => link.rel === 'alternate').map((link) => link.hrefLang);

// R-SEOEXCELLENCE-02, 61 and 62; AC-SEOEXCELLENCE-1, 4 and 7.
describe('articleHead', () => {
  it('declares nothing over the root without a payload', () => {
    expect(articleHead(undefined)).toEqual({
      meta: [],
      links: [],
      scripts: [],
    });
  });

  it('titles the page by the article alone and describes it by its excerpt, as plain text', async () => {
    const page = await articlePage({ locale: 'fr', slug: 'quitter-gmail' });
    const { meta } = articleHead(page);

    expect(meta[0]).toEqual({ title: 'Quitter Gmail' });
    expect(contentOf(meta, 'description')).toBe(page.description);
    expect(contentOf(meta, 'og:type')).toBe('article');
    expect(contentOf(meta, 'og:image')).toBe(`${ORIGIN}${page.coverUrl}`);
  });

  it('is canonical to itself, a translation never to its original, with the hreflang of both and an x-default on the en version', async () => {
    const page = await articlePage({ locale: 'fr', slug: 'quitter-gmail' });
    const { links } = articleHead(page);

    expect(links[0]).toEqual({
      rel: 'canonical',
      href: `${ORIGIN}/fr/articles/c/privacy/quitter-gmail`,
    });
    expect(hreflangs(links)).toEqual(['en', 'fr', 'x-default']);
  });

  it('declares no hreflang for an article without translation', async () => {
    const page = await articlePage({
      locale: 'fr',
      slug: 'quel-langage-pour-progresser-dans-sa-carriere',
    });

    expect(hreflangs(articleHead(page).links)).toEqual([]);
  });

  it('declares the BlogPosting and the BreadcrumbList of what the page shows', async () => {
    const page = await articlePage({ locale: 'en', slug: 'leaving-gmail' });
    const [posting, breadcrumb] = structuredData(articleHead(page));

    expect(posting).toMatchObject({
      '@type': 'BlogPosting',
      headline: 'Leaving Gmail',
      datePublished: '2019-05-24',
      author: { '@type': 'Person', name: 'Nicolas Zozol' },
      inLanguage: 'en',
      image: `${ORIGIN}/article-images/privacy/images/gmail.png`,
    });
    expect(posting).not.toHaveProperty('dateModified');
    expect(breadcrumb).toMatchObject({
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          position: 1,
          name: getPageCopy('en').listing.blogTitle,
          item: `${ORIGIN}/articles`,
        },
        {
          position: 2,
          name: getCategoryLabel('en', 'privacy'),
          item: `${ORIGIN}/articles/c/privacy`,
        },
        { position: 3, name: 'Leaving Gmail' },
      ],
    });
  });

  it('shares no image and declares no image for an article without cover', async () => {
    const page = await articlePage({ locale: 'en', slug: 'leaving-gmail' });
    const coverless: ArticlePage = {
      ...page,
      article: { ...page.article, image: undefined },
      coverUrl: undefined,
    };
    const head = articleHead(coverless);

    expect(contentOf(head.meta, 'og:image')).toBeUndefined();
    expect(structuredData(head)[0]).not.toHaveProperty('image');
  });
});

describe('articleTrail', () => {
  it('is the blog home of the Locale, then its Category, then the article without url', async () => {
    const page = await articlePage({ locale: 'fr', slug: 'quitter-gmail' });

    expect(articleTrail(page)).toEqual([
      { label: getPageCopy('fr').listing.blogTitle, url: '/fr/articles' },
      {
        label: getCategoryLabel('fr', 'privacy'),
        url: '/fr/articles/c/privacy',
      },
      { label: 'Quitter Gmail' },
    ]);
  });
});
