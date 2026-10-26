import type { AddressableArticle, PageUrl, UrlScheme } from './scheme.js';

/**
 * The single derivation of the URL set (R-URLSCHEME-22): every route's
 * pregeneration reads this list and no second list accepts or rejects a URL at
 * request time. It is also the only place a page count is computed from the
 * roll size.
 *
 * It never returns a tag page — the segment is reserved and served by nothing
 * (R-URLSCHEME-31) — and never a landing page, whose copy is not this story's.
 */
export function urlSet(
  scheme: UrlScheme,
  articles: readonly AddressableArticle[],
): PageUrl[] {
  const locales = localesInOrder(scheme, articles);
  const pages: PageUrl[] = [];

  for (const locale of locales) {
    const ofLocale = articles.filter((article) => article.locale === locale);

    for (const page of rollPages(ofLocale.length, scheme.rollSize)) {
      pages.push({ kind: 'blog-home', locale, page });
    }

    for (const category of categoriesInOrder(ofLocale)) {
      const ofCategory = ofLocale.filter((article) => article.category === category);
      for (const page of rollPages(ofCategory.length, scheme.rollSize)) {
        pages.push({ kind: 'category', locale, category, page });
      }
    }

    for (const article of [...ofLocale].sort(bySlug)) {
      pages.push({
        kind: 'article',
        locale,
        ...(article.category === undefined ? {} : { category: article.category }),
        slug: article.slug,
      });
    }
  }

  return pages;
}

/** The default locale always has a blog home; another locale earns one by holding an article. */
function localesInOrder(
  scheme: UrlScheme,
  articles: readonly AddressableArticle[],
): string[] {
  const claimed = new Set(articles.map((article) => article.locale));
  return [
    scheme.defaultLocale,
    ...scheme.otherLocales.filter((locale) => claimed.has(locale)),
  ];
}

function categoriesInOrder(articles: readonly AddressableArticle[]): string[] {
  const claimed = new Set<string>();
  for (const article of articles) {
    if (article.category !== undefined) {
      claimed.add(article.category);
    }
  }
  return [...claimed].sort();
}

function rollPages(count: number, rollSize: number): number[] {
  if (rollSize < 1) {
    throw new Error(`A roll size is an integer of at least 1, got ${rollSize}`);
  }
  const total = Math.max(1, Math.ceil(count / rollSize));
  return Array.from({ length: total }, (_, i) => i + 1);
}

function bySlug(a: AddressableArticle, b: AddressableArticle): number {
  return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
}
