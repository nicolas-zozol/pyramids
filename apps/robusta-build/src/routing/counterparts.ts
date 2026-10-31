import type { ArticleIndexEntry } from '../content/article-index.ts';
import { LOCALES, urlScheme } from './scheme.ts';
import { buildUrl, type PageUrl } from './url-scheme/index.ts';

/** For each other Locale, the same page there, in the order of the scheme; nothing for a Locale that has none. */
export function counterpartsOf(
  page: PageUrl,
  urls: readonly PageUrl[],
  articles: readonly ArticleIndexEntry[],
): PageUrl[] {
  const others = LOCALES.filter((locale) => locale !== page.locale);

  switch (page.kind) {
    case 'landing':
      return others.map((locale) => ({ kind: 'landing', locale }));
    case 'blog-home':
      return within(
        urls,
        others.map((locale) => ({ kind: 'blog-home', locale, page: 1 })),
      );
    case 'category':
      return within(
        urls,
        others.map((locale) => ({
          kind: 'category',
          locale,
          category: page.category,
          page: 1,
        })),
      );
    case 'tag':
      return [];
    case 'article':
      return otherVersions(page, articles, others);
  }
}

function within(urls: readonly PageUrl[], candidates: PageUrl[]): PageUrl[] {
  const built = new Set(urls.map((url) => buildUrl(urlScheme, url)));
  return candidates.filter((candidate) =>
    built.has(buildUrl(urlScheme, candidate)),
  );
}

function otherVersions(
  page: Extract<PageUrl, { kind: 'article' }>,
  articles: readonly ArticleIndexEntry[],
  others: readonly string[],
): PageUrl[] {
  const translationId = articles.find(
    (article) => article.locale === page.locale && article.slug === page.slug,
  )?.translationId;
  if (translationId === undefined) {
    return [];
  }

  return others.flatMap((locale) => {
    const version = articles.find(
      (article) =>
        article.locale === locale && article.translationId === translationId,
    );
    return version === undefined ? [] : [articlePageUrl(version)];
  });
}

function articlePageUrl(article: ArticleIndexEntry): PageUrl {
  return {
    kind: 'article',
    locale: article.locale,
    ...(article.category === undefined ? {} : { category: article.category }),
    slug: article.slug,
  };
}
