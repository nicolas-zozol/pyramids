import { describe, expect, it } from 'vitest';
import type { ArticleIndexEntry } from '../src/content/article-index.ts';
import { urlScheme } from '../src/routing/scheme.ts';
import { landingPages, urlSet } from '../src/routing/url-scheme/index.ts';
import * as seo from '../src/seo/index.ts';
import { siteFiles } from './emit-site-files.mjs';

const article = (
  slug: string,
  locale: string,
  category = 'web',
): ArticleIndexEntry => ({
  path: `${slug}.md`,
  slug,
  locale,
  category,
  title: slug,
  date: '2022-01-01',
  author: 'Nina',
  tags: [],
  excerpt: 'An excerpt.',
});

// R-SEOEXCELLENCE-41 and 43: the two files the build writes beside the pages.
describe('siteFiles', () => {
  const articles = [
    article('one', 'en'),
    article('un', 'fr'),
    article('deux', 'fr', 'theory'),
  ];
  const content = urlSet(urlScheme, articles);
  const files = siteFiles({
    landings: landingPages(urlScheme),
    content,
    articles,
    seo,
  });

  it('writes the sitemap of the indexable pages and robots.txt', () => {
    expect(files.sitemap).toBe(
      seo.sitemapXml(
        seo.sitemapEntries([...landingPages(urlScheme), ...content], articles),
      ),
    );
    expect(files.robots).toBe(seo.robotsTxt());
  });

  it('counts the indexable pages by kind in its summary line', () => {
    expect(files.summary).toBe(
      'site files: sitemap.xml lists 11 indexable pages (3 landing pages, 5 listing pages, 3 articles), robots.txt names it',
    );
  });
});
