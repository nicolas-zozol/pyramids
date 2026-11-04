import { describe, expect, it } from 'vitest';
import {
  expectedDataFiles,
  pagesRenderedWithAnError,
  routeTableReport,
  urlOfHtmlFile,
} from './check-route-table.mjs';

describe('urlOfHtmlFile', () => {
  it('reads a prerendered file back as the canonical path it was written for', () => {
    expect(urlOfHtmlFile('articles/c/web.html')).toBe('/articles/c/web');
    expect(urlOfHtmlFile('fr/articles.html')).toBe('/fr/articles');
    expect(urlOfHtmlFile('fr.html')).toBe('/fr');
  });

  it('reads the index.html at the root as the page at /', () => {
    expect(urlOfHtmlFile('index.html')).toBe('/');
  });
});

describe('routeTableReport', () => {
  const landingUrls = ['/', '/fr'];
  const contentUrls = [
    '/articles',
    '/articles/c/web',
    '/articles/c/web/an-article',
    '/articles/c/web/another-article',
  ];

  const agreeing = {
    htmlFiles: [
      '404.html',
      'index.html',
      'fr.html',
      'articles.html',
      'articles/c/web.html',
      'articles/c/web/an-article.html',
      'articles/c/web/another-article.html',
    ],
    landingUrls,
    contentUrls,
    expectedDataFiles: { articles: 2, notesFeeds: 2 },
    dataFileCount: 4,
  };

  it('agrees when the written pages are the landing pages and the content URLs, and every data file is there', () => {
    expect(routeTableReport(agreeing)).toEqual({
      ok: true,
      built: 6,
      builtButNotDerived: [],
      derivedButNotBuilt: [],
      expectedDataFiles: 4,
      actualDataFiles: 4,
    });
  });

  it('keeps the not-found page out of the comparison', () => {
    const report = routeTableReport(agreeing);

    expect(report.builtButNotDerived).not.toContain('/404');
  });

  it('names / derived but not built when no index.html was written', () => {
    const report = routeTableReport({
      ...agreeing,
      htmlFiles: agreeing.htmlFiles.filter((file) => file !== 'index.html'),
    });

    expect(report.ok).toBe(false);
    expect(report.derivedButNotBuilt).toEqual(['/']);
    expect(report).not.toHaveProperty('rootIndexWritten');
  });

  it('names a page written under the marked default Locale as built but not derived', () => {
    const report = routeTableReport({
      ...agreeing,
      htmlFiles: [...agreeing.htmlFiles, 'en.html', 'en/articles.html'],
    });

    expect(report.ok).toBe(false);
    expect(report.builtButNotDerived).toEqual(['/en', '/en/articles']);
  });

  it('names a landing page derived but not written', () => {
    const report = routeTableReport({
      ...agreeing,
      htmlFiles: agreeing.htmlFiles.filter((file) => file !== 'fr.html'),
    });

    expect(report.ok).toBe(false);
    expect(report.derivedButNotBuilt).toEqual(['/fr']);
  });

  it('names a page written but not derived, and a URL derived but not written', () => {
    const report = routeTableReport({
      ...agreeing,
      htmlFiles: [
        '404.html',
        'index.html',
        'fr.html',
        'articles.html',
        'articles/c/web.html',
        'articles/c/web/an-article.html',
        'articles/p/1.html',
      ],
    });

    expect(report.ok).toBe(false);
    expect(report.builtButNotDerived).toEqual(['/articles/p/1']);
    expect(report.derivedButNotBuilt).toEqual([
      '/articles/c/web/another-article',
    ]);
  });

  it('expects one data file per article and per requested notes feed', () => {
    const report = routeTableReport({ ...agreeing, dataFileCount: 3 });

    expect(report.ok).toBe(false);
    expect(report.expectedDataFiles).toBe(4);
    expect(report.actualDataFiles).toBe(3);
  });

  it('sums every source of data files it is given', () => {
    const report = routeTableReport({
      ...agreeing,
      expectedDataFiles: { articles: 2, notesFeeds: 2, perPage: 6 },
      dataFileCount: 10,
    });

    expect(report.ok).toBe(true);
    expect(report.expectedDataFiles).toBe(10);
  });
});

describe('expectedDataFiles', () => {
  const landings = [
    { kind: 'landing', locale: 'en' },
    { kind: 'landing', locale: 'fr' },
    { kind: 'landing', locale: 'es' },
  ];
  const content = [
    { kind: 'blog-home', locale: 'en', page: 1 },
    { kind: 'category', locale: 'en', category: 'web', page: 1 },
    { kind: 'article', locale: 'en', category: 'web', slug: 'an-article' },
    { kind: 'article', locale: 'en', category: 'web', slug: 'another-article' },
  ];

  it('owes one file per article and one notes feed per landing page', () => {
    expect(expectedDataFiles({ landings, content })).toMatchObject({
      articles: 2,
      notesFeeds: 3,
    });
  });

  it('owes one counterparts file per landing page and per content URL, the not-found page carrying no page URL', () => {
    expect(expectedDataFiles({ landings, content }).counterparts).toBe(7);
  });

  it('owes one roll page file per listing page of the URL set, and one footer rolls file per landing page', () => {
    expect(expectedDataFiles({ landings, content })).toEqual({
      articles: 2,
      notesFeeds: 3,
      counterparts: 7,
      rollPages: 2,
      localeRolls: 3,
    });
  });

  it('owes a roll page file for each page of a roll beyond the first', () => {
    const paged = [
      ...content,
      { kind: 'blog-home', locale: 'en', page: 2 },
      { kind: 'category', locale: 'en', category: 'web', page: 2 },
    ];

    expect(expectedDataFiles({ landings, content: paged }).rollPages).toBe(4);
  });
});

describe('pagesRenderedWithAnError', () => {
  const rendered = {
    file: 'fr/articles/c/privacy.html',
    html: '<header></header><!--$--><main><h1>vie privée</h1></main><!--/$--><footer></footer>',
  };
  const failed = {
    file: 'articles/c/privacy.html',
    html: '<header></header><!--$!--><template></template><!--/$--><footer></footer>',
  };

  it('names the page whose render threw at prerender, its content left to the browser', () => {
    expect(pagesRenderedWithAnError([rendered, failed])).toEqual([
      '/articles/c/privacy',
    ]);
  });

  it('names none when every page rendered in full', () => {
    expect(pagesRenderedWithAnError([rendered])).toEqual([]);
  });
});
