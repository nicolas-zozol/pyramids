import { describe, expect, it } from 'vitest';
import { routeTableReport, urlOfHtmlFile } from './check-route-table.mjs';

describe('urlOfHtmlFile', () => {
  it('reads a prerendered file back as the canonical path it was written for', () => {
    expect(urlOfHtmlFile('articles/c/web.html')).toBe('/articles/c/web');
    expect(urlOfHtmlFile('l/fr/articles.html')).toBe('/l/fr/articles');
  });
});

describe('routeTableReport', () => {
  const derivedUrls = [
    '/articles',
    '/articles/c/web',
    '/articles/c/web/an-article',
    '/articles/c/web/another-article',
  ];

  const agreeing = {
    htmlFiles: [
      'index.html',
      '404.html',
      'articles.html',
      'articles/c/web.html',
      'articles/c/web/an-article.html',
      'articles/c/web/another-article.html',
    ],
    derivedUrls,
    articleCount: 2,
    dataFileCount: 3,
  };

  it('agrees when the written pages are the derived URLs and every article left its data file', () => {
    expect(routeTableReport(agreeing)).toEqual({
      ok: true,
      built: 4,
      builtButNotDerived: [],
      derivedButNotBuilt: [],
      expectedDataFiles: 3,
      actualDataFiles: 3,
    });
  });

  it('keeps the landing page and the not-found page out of the content section', () => {
    const report = routeTableReport(agreeing);

    expect(report.builtButNotDerived).not.toContain('/');
    expect(report.builtButNotDerived).not.toContain('/404');
  });

  it('names a page written but not derived, and a URL derived but not written', () => {
    const report = routeTableReport({
      ...agreeing,
      htmlFiles: [
        'index.html',
        '404.html',
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

  it('fails when the data files are not one per article plus the notes feed', () => {
    const report = routeTableReport({ ...agreeing, dataFileCount: 2 });

    expect(report.ok).toBe(false);
    expect(report.expectedDataFiles).toBe(3);
    expect(report.actualDataFiles).toBe(2);
  });
});
