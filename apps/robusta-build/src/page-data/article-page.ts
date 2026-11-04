import { buildUrl } from '../routing/url-scheme/index.ts';
import {
  getArticleBody,
  getAssetUrl,
  getExcerptText,
} from '../content/article-index.ts';
import { findArticle, findRelated } from '../content/article-lookup.ts';
import { urlScheme } from '../routing/scheme.ts';
import { articlePageUrl, articleUrl } from './article-url.ts';
import { pageCounterparts } from './page-counterparts.ts';
import type { ArticleKey, ArticlePage } from './types.ts';

const RELATED_LIMIT = 3;

/** Everything one article page renders and declares, read from the seams at build. */
export async function articlePage({
  locale,
  slug,
}: ArticleKey): Promise<ArticlePage> {
  const article = await findArticle(locale, slug);
  const [{ html }, versions, related] = await Promise.all([
    getArticleBody(article),
    pageCounterparts(articlePageUrl(article)),
    findRelated(article, RELATED_LIMIT),
  ]);

  return {
    article,
    url: articleUrl(article),
    description: getExcerptText(article),
    html,
    writtenDate: writtenDate(article.date, article.locale),
    ...(article.updated === undefined
      ? {}
      : { writtenUpdated: writtenDate(article.updated, article.locale) }),
    related: related.map((entry) => ({
      title: entry.title,
      url: articleUrl(entry),
    })),
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
