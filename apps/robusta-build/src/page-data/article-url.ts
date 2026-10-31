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

/** The canonical URL of an article, in its own locale and category. */
export function articleUrl(article: ArticleIndexEntry): string {
  return buildUrl(urlScheme, articlePageUrl(article));
}
