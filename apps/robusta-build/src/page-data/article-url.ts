import { buildUrl } from '@robusta/pyramids-routing';
import type { ArticleIndexEntry } from '../content/article-index.js';
import { urlScheme } from '../routing/scheme.js';

/** The canonical URL of an article, in its own locale and category. */
export function articleUrl(article: ArticleIndexEntry): string {
  return buildUrl(urlScheme, {
    kind: 'article',
    locale: article.locale,
    ...(article.category === undefined ? {} : { category: article.category }),
    slug: article.slug,
  });
}
