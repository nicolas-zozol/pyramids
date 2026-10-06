import { describe, expect, it } from 'vitest';
import type { ArticlePage } from '../page-data/index.js';
import { renderInRouter } from '../test-support/render-in-router.js';
import { ArticleView } from './ArticleView.js';

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
  html: '<p>Le corps de l’article.</p>',
  categoryUrl: '/l/fr/articles/c/web',
  writtenDate: '5 mars 2024',
};

const covered: ArticlePage = {
  ...coverless,
  coverUrl: '/article-images/web/images/cover.png',
  translation: {
    url: '/articles/c/web/a-fixture-in-english',
    locale: 'en',
    label: 'English',
  },
};

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

  it('links the category and the other locale at the URLs the payload carries', async () => {
    const html = await renderInRouter(<ArticleView page={covered} />);

    expect(html).toMatch(
      /<a [^>]*href="\/l\/fr\/articles\/c\/web"[^>]*>web<\/a>/,
    );
    expect(html).toMatch(
      /<a [^>]*href="\/articles\/c\/web\/a-fixture-in-english"[^>]*>English<\/a>/,
    );
    expect(html).toMatch(/<a [^>]*hreflang="en"/i);
  });

  it('renders no other-locale link when the payload carries no translation', async () => {
    const html = await renderInRouter(<ArticleView page={coverless} />);

    expect(html).not.toMatch(/hreflang/i);
  });
});
