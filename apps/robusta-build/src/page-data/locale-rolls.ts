import {
  getArticleIndex,
  type ArticleIndexEntry,
} from '../content/article-index.ts';
import { contentUrls } from '../routing/content-urls.ts';
import type { PageUrl, RollUrl } from '../routing/url-scheme/index.ts';
import type { LocaleRequest } from './types.ts';

/** The first page of each roll of a Locale, read from the article index and the URL set at build. */
export async function localeRolls({
  locale,
}: LocaleRequest): Promise<RollUrl[]> {
  const [articles, urls] = await Promise.all([
    getArticleIndex(),
    contentUrls(),
  ]);
  return localeRollsOf(locale, articles, urls);
}

/** The first page of each roll of `locale` in the order of `urls`, blog home first; none when `locale` publishes no article. */
export function localeRollsOf(
  locale: string,
  articles: readonly ArticleIndexEntry[],
  urls: readonly PageUrl[],
): RollUrl[] {
  // The default Locale's blog home is built even empty: the footer links none.
  if (!articles.some((article) => article.locale === locale)) return [];

  return urls.filter(
    (url): url is RollUrl =>
      (url.kind === 'blog-home' || url.kind === 'category') &&
      url.locale === locale &&
      url.page === 1,
  );
}
