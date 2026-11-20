import { buildUrl, type PageUrl } from '../routing/url-scheme/index.ts';
import type { ArticleIndexEntry } from '../content/article-index.ts';
import { urlScheme } from '../routing/scheme.ts';

/** The page of an article, in its own locale and category. */
export function articlePageUrl(article: ArticleIndexEntry): PageUrl {
  return {
    kind: 'article',
    locale: article.locale,
    ...(article.category === undefined ? {} : { category: article.category }),
    slug: article.slug,
  };
}

/** The canonical URL of the first page of the Category an article is filed under, in its own locale; none for an article with no Category. */
export function categoryUrl(article: ArticleIndexEntry): string | undefined {
  return article.category === undefined
    ? undefined
    : buildUrl(urlScheme, {
        kind: 'category',
        locale: article.locale,
        category: article.category,
        page: 1,
      });
}

/** The canonical URL of an article, in its own locale and category. */
export function articleUrl(article: ArticleIndexEntry): string {
  return buildUrl(urlScheme, articlePageUrl(article));
}
