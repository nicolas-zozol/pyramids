import { getArticleIndex, type ArticleIndexEntry } from './article-index.ts';

/**
 * How a route turns its params into the article it renders. The lookup reads
 * `getArticleIndex`, which is where a corpus violation becomes fatal, so a page
 * is never built from an index the schema refused.
 *
 * The module stays free of React and of the design system: `tsconfig.routing.json`
 * includes `src/content` whole and compiles it with plain `tsc`, with no `jsx`
 * option, so the plain-Node build scripts can run it.
 */

/**
 * Lookup is on the locale and the slug alone: `validateArticles` refuses two
 * articles sharing a slug within a locale, so the category param of the two
 * categorised routes identifies nothing the slug does not.
 *
 * It throws rather than returning `undefined` (R-ARTICLEPAGE-06). A slug the
 * index does not carry cannot arrive through a request — the prerender page
 * list derives from this same index and the deploy runs no code — so the only
 * way here is a build, and a build is what must fail.
 */
export async function findArticle(
  locale: string,
  slug: string,
): Promise<ArticleIndexEntry> {
  const found = (await getArticleIndex()).find(
    (entry) => entry.locale === locale && entry.slug === slug,
  );

  if (found === undefined) {
    throw new Error(
      `No article of locale '${locale}' carries the slug '${slug}', and the route table derives from the same index.`,
    );
  }
  return found;
}

/** Published, same Locale, sharing the Category or a tag, itself excluded; same Category first, then more shared tags, then newest; `limit` at most. */
export async function findRelated(
  entry: ArticleIndexEntry,
  limit: number,
): Promise<ArticleIndexEntry[]> {
  return relatedAmong(entry, await getArticleIndex(), limit);
}

/** `findRelated` among the articles of an index, newest first as the index gives them. */
export function relatedAmong(
  entry: ArticleIndexEntry,
  articles: readonly ArticleIndexEntry[],
  limit: number,
): ArticleIndexEntry[] {
  return articles
    .filter(
      (other) =>
        other.locale === entry.locale &&
        other.path !== entry.path &&
        (sameCategory(entry, other) || sharedTags(entry, other) > 0),
    )
    .sort(
      (a, b) =>
        Number(sameCategory(entry, b)) - Number(sameCategory(entry, a)) ||
        sharedTags(entry, b) - sharedTags(entry, a) ||
        newestFirst(a, b),
    )
    .slice(0, limit);
}

function sameCategory(
  entry: ArticleIndexEntry,
  other: ArticleIndexEntry,
): boolean {
  return entry.category !== undefined && other.category === entry.category;
}

function sharedTags(
  entry: ArticleIndexEntry,
  other: ArticleIndexEntry,
): number {
  return other.tags.filter((tag) => entry.tags.includes(tag)).length;
}

function newestFirst(a: ArticleIndexEntry, b: ArticleIndexEntry): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
}
