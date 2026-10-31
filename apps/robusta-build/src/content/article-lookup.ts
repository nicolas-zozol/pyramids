import { getArticleIndex, type ArticleIndexEntry } from './article-index.js';

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
