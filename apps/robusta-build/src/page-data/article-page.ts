import { buildUrl } from '../routing/url-scheme/index.ts';
import { getArticleBody, getAssetUrl } from '../content/article-index.ts';
import { findArticle } from '../content/article-lookup.ts';
import { urlScheme } from '../routing/scheme.ts';
import { articlePageUrl } from './article-url.ts';
import { pageCounterparts } from './page-counterparts.ts';
import type { ArticleKey, ArticlePage } from './types.ts';

/** Everything one article page renders, read from the seams at build. */
export async function articlePage({
  locale,
  slug,
}: ArticleKey): Promise<ArticlePage> {
  const article = await findArticle(locale, slug);
  const [{ html }, versions] = await Promise.all([
    getArticleBody(article),
    pageCounterparts(articlePageUrl(article)),
  ]);

  return {
    article,
    html,
    writtenDate: writtenDate(article.date, article.locale),
    versions: versions.map((version) => ({
      locale: version.locale,
      url: buildUrl(urlScheme, version),
    })),
    ...(article.image === undefined
      ? {}
      : { coverUrl: getAssetUrl(article, article.image) }),
    ...(article.category === undefined
      ? {}
      : {
          categoryUrl: buildUrl(urlScheme, {
            kind: 'category',
            locale: article.locale,
            category: article.category,
            page: 1,
          }),
        }),
  };
}

function writtenDate(date: string, locale: string): string {
  // Formatted in UTC from the calendar date: the build machine's zone would move it by one.
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}
