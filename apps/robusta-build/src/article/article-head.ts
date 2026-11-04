import type { ArticlePage } from '../page-data/index.ts';
import { urlScheme } from '../routing/scheme.ts';
import { buildUrl } from '../routing/url-scheme/index.ts';
import {
  articleData,
  breadcrumbData,
  pageHead,
  type Crumb,
  type RouteHead,
} from '../seo/index.ts';
import { getCategoryLabel, getPageCopy } from '../seopyramids.config.ts';

/** Title, plain excerpt, indexable, versions, cover, BlogPosting and BreadcrumbList; without a payload, nothing over the root. */
export function articleHead(page?: ArticlePage): RouteHead {
  if (page === undefined) {
    return { meta: [], links: [], scripts: [] };
  }
  const { article, coverUrl } = page;
  return pageHead({
    locale: article.locale,
    url: page.url,
    title: article.title,
    description: page.description,
    indexable: true,
    versions: page.versions,
    ...(coverUrl === undefined ? {} : { image: coverUrl }),
    shareType: 'article',
    structuredData: [
      articleData(article, coverUrl),
      breadcrumbData(articleTrail(page)),
    ],
  });
}

/** Blog home, then its Category when it claims one, then the article without url. */
export function articleTrail(page: ArticlePage): Crumb[] {
  const { article, categoryUrl } = page;
  const blogHome = buildUrl(urlScheme, {
    kind: 'blog-home',
    locale: article.locale,
    page: 1,
  });
  return [
    { label: getPageCopy(article.locale).listing.blogTitle, url: blogHome },
    ...(article.category === undefined || categoryUrl === undefined
      ? []
      : [
          {
            label: getCategoryLabel(article.locale, article.category),
            url: categoryUrl,
          },
        ]),
    { label: article.title },
  ];
}
