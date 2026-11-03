import { describe, expect, it } from 'vitest';
import type { ArticleIndexEntry } from '../content/article-index.ts';
import { counterpartsOf } from './counterparts.ts';
import { urlScheme } from './scheme.ts';
import {
  buildUrl,
  landingPages,
  parseUrl,
  urlSet,
  type PageUrl,
} from './url-scheme/index.ts';

function entry(
  fields: Pick<ArticleIndexEntry, 'locale' | 'slug'> &
    Partial<ArticleIndexEntry>,
): ArticleIndexEntry {
  return {
    path: `${fields.category ?? 'misc'}/${fields.slug}.md`,
    title: fields.slug,
    date: '2024-03-05',
    author: 'Nicolas Zozol',
    tags: [],
    excerpt: 'An excerpt.',
    ...fields,
  };
}

/** The landings and the content URLs a corpus of `articles` derives, as `getCounterparts` hands them over. */
function siteOf(articles: ArticleIndexEntry[]): PageUrl[] {
  return [...landingPages(urlScheme), ...urlSet(urlScheme, articles)];
}

function counterpartsAt(
  path: string,
  articles: ArticleIndexEntry[],
  urls: PageUrl[] = siteOf(articles),
): string[] {
  const page = parseUrl(urlScheme, path);
  if (page === undefined) throw new Error(`${path} is no URL of the scheme`);
  return counterpartsOf(page, urls, articles).map((counterpart) =>
    buildUrl(urlScheme, counterpart),
  );
}

const french = (slug: string, category = 'web') =>
  entry({ locale: 'fr', slug, category });
const english = (slug: string, category = 'web') =>
  entry({ locale: 'en', slug, category });

const THIRTEEN_FRENCH = Array.from({ length: 13 }, (_, i) =>
  french(`article-${i + 1}`),
);

describe('counterpartsOf a landing page', () => {
  it('is the landing page of each other Locale, in the order of the scheme', () => {
    expect(counterpartsAt('/fr', [])).toEqual(['/', '/es']);
    expect(counterpartsAt('/', [])).toEqual(['/fr', '/es']);
    expect(counterpartsAt('/es', [])).toEqual(['/', '/fr']);
  });
});

describe('counterpartsOf a page of the blog roll', () => {
  const articles = [...THIRTEEN_FRENCH, english('one-article')];

  it('is the first page of the roll in each other Locale that has it', () => {
    expect(counterpartsAt('/fr/articles', articles)).toEqual(['/articles']);
  });

  it('leads a page beyond the first to the first page of the same roll', () => {
    expect(siteOf(articles).map((page) => buildUrl(urlScheme, page))).toContain(
      '/fr/articles/p/2',
    );
    expect(counterpartsAt('/fr/articles/p/2', articles)).toEqual(['/articles']);
  });

  it('is nothing in a Locale whose roll the URLs do not contain, the landing fallback belonging to the header', () => {
    expect(counterpartsAt('/articles', articles)).toEqual(['/fr/articles']);
    expect(
      counterpartsAt('/articles', articles, landingPages(urlScheme)),
    ).toEqual([]);
  });
});

describe('counterpartsOf a Category page', () => {
  const theory = french('quel-second-langage', 'theory');

  it('is nothing while a single Locale claims the Category', () => {
    expect(counterpartsAt('/fr/articles/c/theory', [theory])).toEqual([]);
  });

  it('is the Category page of the other Locale once its first article there is published', () => {
    const articles = [theory, english('which-second-language', 'theory')];

    expect(counterpartsAt('/fr/articles/c/theory', articles)).toEqual([
      '/articles/c/theory',
    ]);
    expect(counterpartsAt('/articles/c/theory', articles)).toEqual([
      '/fr/articles/c/theory',
    ]);
  });

  it('leads a page beyond the first to the first page of the Category in the other Locale', () => {
    const articles = [...THIRTEEN_FRENCH, english('one-article')];

    expect(counterpartsAt('/fr/articles/c/web/p/2', articles)).toEqual([
      '/articles/c/web',
    ]);
  });
});

describe('counterpartsOf an article', () => {
  /**
   * One original in English and its two translations, French and Spanish,
   * tied by the translation identifier `leaving-gmail`; a fourth article of
   * another identifier stays out of the trio.
   */
  const trio = [
    entry({
      locale: 'en',
      slug: 'leaving-gmail',
      category: 'privacy',
      translationId: 'leaving-gmail',
    }),
    entry({
      locale: 'fr',
      slug: 'quitter-gmail',
      category: 'privacy',
      translationId: 'leaving-gmail',
    }),
    entry({
      locale: 'es',
      slug: 'dejar-gmail',
      translationId: 'leaving-gmail',
    }),
    entry({
      locale: 'fr',
      slug: 'autre-sujet',
      category: 'privacy',
      translationId: 'other-topic',
    }),
  ];

  it('is every other published version of the same translation identifier, in the order of the scheme', () => {
    expect(counterpartsAt('/articles/c/privacy/leaving-gmail', trio)).toEqual([
      '/fr/articles/c/privacy/quitter-gmail',
      '/es/articles/dejar-gmail',
    ]);
    expect(
      counterpartsAt('/fr/articles/c/privacy/quitter-gmail', trio),
    ).toEqual([
      '/articles/c/privacy/leaving-gmail',
      '/es/articles/dejar-gmail',
    ]);
    expect(counterpartsAt('/es/articles/dejar-gmail', trio)).toEqual([
      '/articles/c/privacy/leaving-gmail',
      '/fr/articles/c/privacy/quitter-gmail',
    ]);
  });

  it('is nothing for an article declaring no translation identifier', () => {
    expect(counterpartsAt('/fr/articles/c/web/seul', [french('seul')])).toEqual(
      [],
    );
  });

  it('is nothing when the other version is not published, never a fallback', () => {
    const [, quitter] = trio;

    expect(
      counterpartsAt('/fr/articles/c/privacy/quitter-gmail', [quitter]),
    ).toEqual([]);
  });
});

describe('counterpartsOf a tag page', () => {
  it('is nothing', () => {
    const tagged: PageUrl = { kind: 'tag', locale: 'fr', tag: 'css', page: 1 };

    expect(
      counterpartsOf(tagged, siteOf(THIRTEEN_FRENCH), THIRTEEN_FRENCH),
    ).toEqual([]);
  });
});
