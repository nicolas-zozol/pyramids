import { fixtureArticles } from './fixture-articles.js';

/**
 * The seam content-source implements. Deliberately without the article body:
 * the route table needs an address and a title, not a document.
 *
 * No `tags` field — a tag addresses nothing, so the route table has no use for
 * it, and content-source is free to carry tags wherever the page body needs
 * them.
 *
 * Called from `generateStaticParams` and from page bodies at build time, and
 * from nothing else (BR-PYRAMID-7).
 */
export interface ArticleIndexEntry {
  slug: string;
  locale: string;
  category?: string;
  title: string;
  date: string;
}

export function getArticleIndex(): Promise<ArticleIndexEntry[]> {
  return Promise.resolve(fixtureArticles);
}
