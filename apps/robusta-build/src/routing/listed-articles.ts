import type { ArticleIndexEntry } from '../content/article-index.ts';
import { NOTES_FEED_SIZE, urlScheme } from './scheme.ts';
import type { PageUrl, RollUrl } from './url-scheme/index.ts';

/** A landing page: the NOTES_FEED_SIZE newest of its Locale; a roll page: its slice; any other page: none. `articles` newest first, as the index gives them. */
export function articlesListedBy(
  page: PageUrl,
  articles: readonly ArticleIndexEntry[],
): readonly ArticleIndexEntry[] {
  switch (page.kind) {
    case 'landing':
      return articles
        .filter((article) => article.locale === page.locale)
        .slice(0, NOTES_FEED_SIZE);
    case 'blog-home':
    case 'category': {
      const start = (page.page - 1) * urlScheme.rollSize;
      return articles
        .filter((article) => inRoll(article, page))
        .slice(start, start + urlScheme.rollSize);
    }
    case 'tag':
    case 'article':
      return [];
  }
}

function inRoll(article: ArticleIndexEntry, page: RollUrl): boolean {
  return (
    article.locale === page.locale &&
    (page.kind === 'blog-home' || article.category === page.category)
  );
}
