import { describe, expect, it } from 'vitest';
import type { ArticlePage } from '../page-data/index.ts';
import { getCategoryLabel, getPageCopy } from '../seopyramids.config.ts';
import { htmlText } from '../test-support/markup.ts';
import { renderInRouter } from '../test-support/render-in-router.tsx';
import { ArticleView } from './ArticleView.tsx';

/**
 * A fixture page rather than the corpus: every migrated article declares a
 * cover, so the coverless article exists only here.
 */
const coverless: ArticlePage = {
  article: {
    path: 'web/a-fixture.md',
    slug: 'a-fixture',
    locale: 'fr',
    category: 'web',
    title: 'Un article sans couverture',
    date: '2024-03-05',
    author: 'Nina',
    tags: ['web', 'css'],
    excerpt: 'Un extrait.',
  },
  url: '/fr/articles/c/web/a-fixture',
  description: 'Un extrait.',
  html: '<p>Le corps de l’article.</p>',
  categoryUrl: '/fr/articles/c/web',
  writtenDate: '5 mars 2024',
  versions: [],
  related: [],
};

const covered: ArticlePage = {
  ...coverless,
  coverUrl: '/article-images/web/images/cover.png',
  versions: [{ locale: 'en', url: '/en/articles/c/web/a-fixture-in-english' }],
};

const english: ArticlePage = {
  ...covered,
  article: {
    ...covered.article,
    slug: 'a-fixture-in-english',
    locale: 'en',
    title: 'An article with a cover',
  },
  categoryUrl: '/en/articles/c/web',
  writtenDate: 'March 5, 2024',
  versions: [{ locale: 'fr', url: '/fr/articles/c/web/a-fixture' }],
};

/** The French version of an article written in English, French and Spanish. */
const ofThree: ArticlePage = {
  ...coverless,
  versions: [
    { locale: 'en', url: '/en/articles/c/web/a-fixture-in-english' },
    { locale: 'es', url: '/es/articles/c/web/un-articulo' },
  ],
};

const inPrivacy: ArticlePage = {
  ...coverless,
  article: { ...coverless.article, category: 'privacy' },
  categoryUrl: '/fr/articles/c/privacy',
};

/** The last nav of the page: the end of page, the breadcrumb leading it. */
const endOfPage = (html: string): string => {
  const start = html.lastIndexOf('<nav');
  return html.slice(start, html.indexOf('</nav>', start) + '</nav>'.length);
};

const breadcrumbOf = (html: string): string =>
  html.slice(html.indexOf('<nav'), html.indexOf('</nav>') + '</nav>'.length);

describe('ArticleView', () => {
  it('renders the title, the written date, the author and the body', async () => {
    const html = await renderInRouter(<ArticleView page={coverless} />);

    expect(html).toContain('<h1>Un article sans couverture</h1>');
    expect(html).toMatch(/<time dateTime="2024-03-05">5 mars 2024<\/time>/);
    expect(html).toContain('Nina');
    expect(html).toContain('<p>Le corps de l’article.</p>');
  });

  it('states the article’s own locale on the article element', async () => {
    const html = await renderInRouter(<ArticleView page={coverless} />);

    expect(html).toMatch(/<article lang="fr">/);
  });

  it('renders no cover box for an article declaring no cover', async () => {
    const html = await renderInRouter(<ArticleView page={coverless} />);

    expect(html).not.toContain('<img');
    expect(html).not.toContain('aspect-ratio');
  });

  it('renders the cover as a plain image with an empty alt, loaded eagerly in its 16:9 box', async () => {
    const html = await renderInRouter(<ArticleView page={covered} />);

    expect(html).toContain('aspect-ratio:16 / 9');
    expect(html).toMatch(
      /<img [^>]*src="\/article-images\/web\/images\/cover\.png"/,
    );
    expect(html).toMatch(/<img [^>]*alt=""/);
    expect(html).toMatch(/<img [^>]*loading="eager"/);
  });

  it('links the category and the other version at the URLs the payload carries', async () => {
    const html = await renderInRouter(<ArticleView page={covered} />);

    expect(html).toMatch(/<a [^>]*href="\/fr\/articles\/c\/web"[^>]*>web<\/a>/);
    expect(html).toMatch(
      new RegExp(
        `<a [^>]*href="/en/articles/c/web/a-fixture-in-english"[^>]*>${htmlText(getPageCopy('en').localeName)}</a>`,
      ),
    );
    expect(html).toMatch(/<a [^>]*hreflang="en"/i);
  });

  it('links every other version, each named by the page copy of its Locale, under its lang and hrefLang', async () => {
    const { versionsPrefix } = getPageCopy('fr').article;
    const html = endOfPage(
      await renderInRouter(<ArticleView page={ofThree} />),
    );
    const link = (locale: string, url: string) =>
      `<a [^>]*href="${url}"[^>]*>${htmlText(getPageCopy(locale).localeName)}</a>`;

    expect(html).toMatch(
      new RegExp(
        `<p>${htmlText(versionsPrefix)}${link('en', '/en/articles/c/web/a-fixture-in-english')}, ${link('es', '/es/articles/c/web/un-articulo')}</p>`,
      ),
    );
    for (const locale of ['en', 'es']) {
      expect(html).toMatch(new RegExp(`<a [^>]*hreflang="${locale}"`, 'i'));
      expect(html).toMatch(new RegExp(`<a [^>]* lang="${locale}"`));
    }
  });

  it('writes the category line in the article’s Locale, at the article’s own address', async () => {
    const { categoryPrefix } = getPageCopy('fr').article;
    const html = await renderInRouter(
      <ArticleView page={covered} />,
      '/fr/articles/c/web/a-fixture',
    );

    expect(html).toContain(
      `<p>${htmlText(categoryPrefix)}<a href="/fr/articles/c/web">${htmlText(getCategoryLabel('fr', 'web'))}</a></p>`,
    );
  });

  it('names the category by its label in the article’s Locale, never by its slug', async () => {
    const html = endOfPage(
      await renderInRouter(<ArticleView page={inPrivacy} />),
    );

    expect(getCategoryLabel('fr', 'privacy')).not.toBe('privacy');
    expect(html).toMatch(
      new RegExp(
        `<a [^>]*href="/fr/articles/c/privacy"[^>]*>${htmlText(getCategoryLabel('fr', 'privacy'))}</a>`,
      ),
    );
  });

  it('throws naming the Category and the Locale when that Locale has no label for the article’s Category', () => {
    const unlabelled: ArticlePage = {
      ...english,
      article: { ...english.article, category: 'theory' },
      categoryUrl: '/en/articles/c/theory',
    };

    expect(() => ArticleView({ page: unlabelled })).toThrow(
      /"theory"[\s\S]*"en"/,
    );
  });

  it('writes its end of page in the article’s Locale, under the language of the article', async () => {
    for (const page of [covered, english]) {
      const { navLabel } = getPageCopy(page.article.locale).article;
      const html = await renderInRouter(<ArticleView page={page} />);
      const nav = endOfPage(html);

      expect(nav).toMatch(
        new RegExp(`^<nav [^>]*aria-label="${htmlText(navLabel)}"`),
      );
      expect(nav).not.toMatch(/^<nav [^>]*lang=/);
      expect(
        html.indexOf(`<article lang="${page.article.locale}">`),
      ).toBeLessThan(html.lastIndexOf('<nav'));
    }
  });

  it('leads the other language with the prefix of the article’s Locale, the language named in its own language', async () => {
    const { categoryPrefix, versionsPrefix } = getPageCopy('en').article;
    const french = getPageCopy('fr');
    const html = endOfPage(
      await renderInRouter(<ArticleView page={english} />),
    );

    expect(html).toContain(`<p>${htmlText(categoryPrefix)}<a `);
    expect(html).toMatch(
      new RegExp(
        `<p>${htmlText(versionsPrefix)}<a [^>]*href="/fr/articles/c/web/a-fixture"[^>]*>${htmlText(french.localeName)}</a></p>`,
      ),
    );
    expect(html).toMatch(/<a [^>]*hreflang="fr"/i);
    expect(html).toMatch(/<a [^>]* lang="fr"/);
    expect(html).not.toContain(htmlText(french.article.categoryPrefix));
    expect(html).not.toContain(htmlText(french.article.versionsPrefix));
  });

  it('renders no version line when the payload carries no other version', async () => {
    const { versionsPrefix } = getPageCopy('fr').article;
    const html = await renderInRouter(<ArticleView page={coverless} />);

    expect(html).not.toMatch(/hreflang/i);
    expect(html).not.toContain(htmlText(versionsPrefix));
  });

  // R-SEOEXCELLENCE-62: blog home, Category, then the article as text.
  it('leads the page with its breadcrumb, above the cover, named by the page copy of its Locale', async () => {
    const french = getPageCopy('fr');
    const html = await renderInRouter(<ArticleView page={covered} />);
    const nav = breadcrumbOf(html);

    expect(html.indexOf(nav)).toBeLessThan(html.indexOf('<img'));
    expect(nav).toMatch(
      new RegExp(
        `^<nav [^>]*aria-label="${htmlText(french.breadcrumb.navLabel)}"`,
      ),
    );
    expect(nav).toMatch(
      new RegExp(
        [
          '<ol[^>]*>',
          `<li><a href="/fr/articles">${htmlText(french.listing.blogTitle)}</a></li>`,
          `<li><a href="/fr/articles/c/web">${htmlText(getCategoryLabel('fr', 'web'))}</a></li>`,
          `<li><span aria-current="page">${htmlText(covered.article.title)}</span></li>`,
          '</ol>',
        ].join(''),
      ),
    );
  });

  it('leaves the Category out of the breadcrumb of an article that claims none', async () => {
    const uncategorised: ArticlePage = {
      ...english,
      article: { ...english.article, category: undefined },
      categoryUrl: undefined,
    };
    const nav = breadcrumbOf(
      await renderInRouter(<ArticleView page={uncategorised} />),
    );

    expect(nav.match(/<li>/g)).toHaveLength(2);
    expect(nav).toContain('<a href="/articles">');
  });

  // R-SEOEXCELLENCE-65.
  it('shows the update date beside the publication date, in a time element, only when the article declares one', async () => {
    const { updatedPrefix } = getPageCopy('fr').article;
    const revised: ArticlePage = {
      ...coverless,
      article: { ...coverless.article, updated: '2024-06-02' },
      writtenUpdated: '2 juin 2024',
    };
    const html = await renderInRouter(<ArticleView page={revised} />);

    expect(html).toMatch(
      new RegExp(
        `<time dateTime="2024-03-05">5 mars 2024</time>[^<]*${htmlText(updatedPrefix)}[^<]*<time dateTime="2024-06-02">2 juin 2024</time>`,
      ),
    );
    expect(
      await renderInRouter(<ArticleView page={coverless} />),
    ).not.toContain(htmlText(updatedPrefix));
  });

  // R-SEOEXCELLENCE-82, AC-SEOEXCELLENCE-5.
  it('ends the page on its Related articles, an h2 and a list of links to their titles, after the end of page', async () => {
    const { relatedTitle } = getPageCopy('fr').article;
    const related: ArticlePage = {
      ...coverless,
      related: [
        { title: 'Un autre article', url: '/fr/articles/c/web/un-autre' },
        { title: 'Un troisième', url: '/fr/articles/c/web/un-troisieme' },
      ],
    };
    const html = await renderInRouter(<ArticleView page={related} />);
    const block = html.slice(
      html.indexOf(`<h2>${htmlText(relatedTitle)}</h2>`),
    );

    expect(html.indexOf('</nav>', html.lastIndexOf('<nav'))).toBeLessThan(
      html.indexOf(`<h2>${htmlText(relatedTitle)}</h2>`),
    );
    expect(block).toMatch(
      /^<h2>[^<]*<\/h2><ul><li><a href="\/fr\/articles\/c\/web\/un-autre">Un autre article<\/a><\/li><li><a href="\/fr\/articles\/c\/web\/un-troisieme">Un troisième<\/a><\/li><\/ul>/,
    );
  });

  it('renders no Related articles block when the article has none', async () => {
    const { relatedTitle } = getPageCopy('fr').article;
    const html = await renderInRouter(<ArticleView page={coverless} />);

    expect(html).not.toContain(htmlText(relatedTitle));
    expect(html).not.toContain('<h2');
  });
});
