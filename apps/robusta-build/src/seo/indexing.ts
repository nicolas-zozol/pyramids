import type { ArticleIndexEntry } from '../content/article-index.ts';
import { articlesListedBy } from '../routing/listed-articles.ts';
import type { PageUrl } from '../routing/url-scheme/index.ts';

/** The go-live switch: a build-time constant, false in this story. */
export const INDEXING_OPEN: boolean = false;

/** 'index, follow' only when indexable and indexing is open, 'noindex, nofollow' otherwise. */
export function robotsOf(indexable: boolean, open = INDEXING_OPEN): string {
  return indexable && open ? 'index, follow' : 'noindex, nofollow';
}

/** Landing and article pages; a roll page when it lists an article; never a tag page. */
export function isIndexable(
  page: PageUrl,
  articles: readonly ArticleIndexEntry[],
): boolean {
  switch (page.kind) {
    case 'landing':
    case 'article':
      return true;
    case 'tag':
      return false;
    case 'blog-home':
    case 'category':
      return articlesListedBy(page, articles).length > 0;
  }
}
