import { buildUrl } from '@robusta/pyramids-routing';
import {
  getArticleBody,
  getAssetUrl,
  type ArticleIndexEntry,
} from '../content/article-index.js';
import { findArticle, findTranslation } from '../content/article-lookup.js';
import { urlScheme } from '../routing/scheme.js';
import { articleUrl } from './article-url.js';
import type { ArticleKey, ArticlePage, TranslationLink } from './types.js';

/** Everything one article page renders, read from the seams at build. */
export async function articlePage({
  locale,
  slug,
}: ArticleKey): Promise<ArticlePage> {
  const article = await findArticle(locale, slug);
  const [{ html }, translation] = await Promise.all([
    getArticleBody(article),
    findTranslation(article),
  ]);

  return {
    article,
    html,
    writtenDate: writtenDate(article.date, article.locale),
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
    ...(translation === undefined
      ? {}
      : { translation: translationLink(translation) }),
  };
}

function translationLink(translation: ArticleIndexEntry): TranslationLink {
  return {
    url: articleUrl(translation),
    locale: translation.locale,
    label: languageName(translation.locale),
  };
}

function writtenDate(date: string, locale: string): string {
  // Formatted in UTC from the calendar date: the build machine's zone would move it by one.
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

function languageName(locale: string): string {
  const display = new Intl.DisplayNames([locale], { type: 'language' });
  return display.of(locale) ?? locale;
}
