import { describe, expect, it } from 'vitest';
import type { ArticleIndexEntry } from '../content/article-index.ts';
import { articleData, breadcrumbData, organizationData } from './index.ts';

const leavingGmail: ArticleIndexEntry = {
  path: 'privacy/leaving-gmail.md',
  slug: 'leaving-gmail',
  locale: 'en',
  category: 'privacy',
  title: 'Leaving Gmail',
  date: '2019-05-24',
  author: 'Nicolas Zozol',
  tags: ['web'],
  excerpt: 'GMail was a revolution in 2004.',
};

// R-SEOEXCELLENCE-61, AC-SEOEXCELLENCE-4 and 7.
describe('articleData', () => {
  it('declares a BlogPosting from what the page shows: headline, publication date, author, language, cover', () => {
    expect(
      articleData(leavingGmail, '/article-images/privacy/images/gmail.png'),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: 'Leaving Gmail',
      datePublished: '2019-05-24',
      author: { '@type': 'Person', name: 'Nicolas Zozol' },
      inLanguage: 'en',
      image:
        'https://www.robusta.build/article-images/privacy/images/gmail.png',
    });
  });

  it('declares dateModified only when the article declares an update date', () => {
    expect(
      articleData({ ...leavingGmail, updated: '2024-02-01' }),
    ).toMatchObject({
      dateModified: '2024-02-01',
    });
    expect(articleData(leavingGmail)).not.toHaveProperty('dateModified');
  });

  it('declares no image for an article without cover', () => {
    expect(articleData(leavingGmail)).not.toHaveProperty('image');
  });
});

// R-SEOEXCELLENCE-61 to 63.
describe('breadcrumbData', () => {
  it('lists each crumb in order, its item absolute and only on a crumb that carries a url', () => {
    expect(
      breadcrumbData([
        { label: 'articles', url: '/articles' },
        { label: 'Privacy', url: '/articles/c/privacy' },
        { label: 'Leaving Gmail' },
      ]),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'articles',
          item: 'https://www.robusta.build/articles',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Privacy',
          item: 'https://www.robusta.build/articles/c/privacy',
        },
        { '@type': 'ListItem', position: 3, name: 'Leaving Gmail' },
      ],
    });
  });
});

// R-SEOEXCELLENCE-64: an Organization, never a LocalBusiness, with no address.
describe('organizationData', () => {
  it('declares the name, the url, the email and the profiles of the organization', () => {
    expect(
      organizationData(
        'Robusta Build',
        'https://www.robusta.build/fr',
        'nicolas@robusta.build',
        ['https://www.linkedin.com/in/robustacode/'],
      ),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Robusta Build',
      url: 'https://www.robusta.build/fr',
      email: 'nicolas@robusta.build',
      sameAs: ['https://www.linkedin.com/in/robustacode/'],
    });
  });
});
