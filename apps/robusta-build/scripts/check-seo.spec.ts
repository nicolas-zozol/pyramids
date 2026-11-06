import { describe, expect, it } from 'vitest';
import { robotsOf } from '../src/seo/index.ts';
import { seoReport } from './check-seo.mjs';

const ORIGIN = 'https://www.robusta.build';

interface FixturePage {
  lang?: string;
  title?: string;
  description?: string;
  robots?: string;
  canonical?: string;
  alternates?: [string, string][];
  body?: string;
}

/** A prerendered page as the build writes it, head and body. */
function page({
  lang = 'en',
  title,
  description,
  robots = 'noindex, nofollow',
  canonical,
  alternates = [],
  body = '<h1>A page</h1>',
}: FixturePage): string {
  return [
    `<!DOCTYPE html><html lang="${lang}"><head><meta charSet="utf-8"/>`,
    '<link rel="stylesheet" href="/assets/site.css"/>',
    title === undefined ? '' : `<title>${title}</title>`,
    description === undefined
      ? ''
      : `<meta name="description" content="${description}"/>`,
    `<meta name="robots" content="${robots}"/>`,
    canonical === undefined
      ? ''
      : `<link rel="canonical" href="${ORIGIN}${canonical}"/>`,
    ...alternates.map(
      ([lang, path]) =>
        `<link rel="alternate" hrefLang="${lang}" href="${ORIGIN}${path}"/>`,
    ),
    `</head><body>${body}</body></html>`,
  ].join('');
}

const sitemapOf = (...paths: string[]) =>
  `<urlset>${paths.map((path) => `<url><loc>${ORIGIN}${path}</loc></url>`).join('')}</urlset>`;

/**
 * A healthy build: `/` and `/fr`, each the other's version, a 404 page
 * that declares nothing, a stylesheet, and the sitemap of the two pages.
 */
function healthy() {
  return {
    pages: [
      {
        file: 'index.html',
        html: page({
          title: 'Home',
          description: 'The home.',
          canonical: '/',
          alternates: [
            ['en', '/'],
            ['fr', '/fr'],
            ['x-default', '/'],
          ],
          body: '<h1>Home</h1><a href="/fr">fr</a><a href="mailto:a@b.c">mail</a>',
        }),
      },
      {
        file: 'fr.html',
        html: page({
          lang: 'fr',
          title: 'Accueil',
          description: "L'accueil.",
          canonical: '/fr',
          alternates: [
            ['en', '/'],
            ['fr', '/fr'],
            ['x-default', '/'],
          ],
          body: '<h1>Accueil</h1><a href="/#top">en</a>',
        }),
      },
      {
        file: '404.html',
        html: page({ title: 'Not found', description: 'Nothing here.' }),
      },
    ],
    sitemap: sitemapOf('/', '/fr'),
    files: [
      'index.html',
      'fr.html',
      '404.html',
      'assets/site.css',
      'sitemap.xml',
    ],
    robotsOf: (indexable: boolean) => robotsOf(indexable),
    indexingOpen: false,
    origin: ORIGIN,
  };
}

// R-SEOEXCELLENCE-141 and 142, AC-SEOEXCELLENCE-6.
describe('seoReport', () => {
  it('finds no defect in a healthy build, and counts the pages checked and the indexable ones', () => {
    expect(seoReport(healthy())).toEqual({
      defects: [],
      checked: 3,
      indexable: 2,
      summary:
        'seo: 3 pages checked, 2 indexable and all in the sitemap; indexing closed',
    });
  });

  it('says indexing is open once it is', () => {
    const build = {
      ...healthy(),
      indexingOpen: true,
      robotsOf: (indexable: boolean) => robotsOf(indexable, true),
    };
    build.pages = build.pages.map((entry) =>
      entry.file === '404.html'
        ? entry
        : {
            ...entry,
            html: entry.html.replace('noindex, nofollow', 'index, follow'),
          },
    );

    expect(seoReport(build).summary).toMatch(/; indexing open$/);
    expect(seoReport(build).defects).toEqual([]);
  });

  it('names a page with no title, no description, or one shared with another page of its lang', () => {
    const build = healthy();
    build.pages.push(
      {
        file: 'other.html',
        html: page({ title: 'Home', description: 'The home.' }),
      },
      { file: 'bare.html', html: page({}) },
    );
    build.files.push('other.html', 'bare.html');

    expect(seoReport(build).defects).toEqual(
      expect.arrayContaining([
        '/other: title shared with /',
        '/other: description shared with /',
        '/bare: no title',
        '/bare: no description',
      ]),
    );
  });

  it('accepts one title in two langs', () => {
    const build = healthy();
    build.pages[1].html = build.pages[1].html.replace(
      'Accueil</title>',
      'Home</title>',
    );

    expect(seoReport(build).defects).toEqual([]);
  });

  it('names a canonical URL missing from the sitemap, and a sitemap entry no built page declares canonical', () => {
    const build = { ...healthy(), sitemap: sitemapOf('/', '/es') };

    expect(seoReport(build).defects).toEqual([
      `/fr: canonical URL ${ORIGIN}/fr is not in the sitemap`,
      `${ORIGIN}/es: in the sitemap, but no built page declares it canonical`,
    ]);
  });

  it('names a page canonical to another page', () => {
    const build = healthy();
    build.pages[1].html = build.pages[1].html.replace(
      `canonical" href="${ORIGIN}/fr"`,
      `canonical" href="${ORIGIN}/"`,
    );

    expect(seoReport(build).defects).toContain(
      `/fr: canonical URL ${ORIGIN}/ names another page`,
    );
  });

  it('names an internal link leading to no built page and no file', () => {
    const build = healthy();
    build.pages[0].html = build.pages[0].html.replace(
      '<a href="/fr">',
      '<a href="/de">',
    );

    expect(seoReport(build).defects).toEqual([
      '/: link to /de leads to no built page or file',
    ]);
  });

  it('names an alternate leading to a page not built, and one the other page does not return', () => {
    const build = healthy();
    build.pages[0].html = build.pages[0].html.replace(
      `<link rel="alternate" hrefLang="x-default"`,
      `<link rel="alternate" hrefLang="es" href="${ORIGIN}/es"/><link rel="alternate" hrefLang="x-default"`,
    );
    build.pages[1].html = build.pages[1].html.replace(
      `<link rel="alternate" hrefLang="en" href="${ORIGIN}/"/>`,
      '',
    );

    expect(seoReport(build).defects).toEqual([
      `/: alternate fr ${ORIGIN}/fr does not link back`,
      `/: alternate es ${ORIGIN}/es leads to no built page`,
    ]);
  });

  it('names a page with no h1 or with two', () => {
    const build = healthy();
    build.pages[0].html = build.pages[0].html.replace(
      '<h1>Home</h1>',
      '<h1>Home</h1><h1>Again</h1>',
    );
    build.pages[2].html = build.pages[2].html.replace(
      '<h1>A page</h1>',
      '<h2>A page</h2>',
    );

    expect(seoReport(build).defects).toEqual([
      '/: 2 h1 headings, one expected',
      '/404: 0 h1 headings, one expected',
    ]);
  });

  it('names a robots that is not robotsOf the presence of its canonical URL', () => {
    const build = healthy();
    build.pages[0].html = build.pages[0].html.replace(
      'noindex, nofollow',
      'index, follow',
    );

    expect(seoReport(build).defects).toEqual([
      "/: robots 'index, follow', expected 'noindex, nofollow'",
    ]);
  });

  it('names a page carrying raw NUL bytes, and accepts the escaped form', () => {
    const build = healthy();
    build.pages[0].html = build.pages[0].html.replace(
      '</body>',
      '<script>m={i:"__root__\0",j:"\0x\0"}</script></body>',
    );
    build.pages[1].html = build.pages[1].html.replace(
      '</body>',
      '<script>m={i:"__root__\\u0000"}</script></body>',
    );

    expect(seoReport(build).defects).toEqual([
      '/: 3 raw NUL bytes, read as U+FFFD by the HTML parser',
    ]);
  });
});
