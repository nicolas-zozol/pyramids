import {
  CATEGORY_DISCRIMINANT,
  LOCALE_DISCRIMINANT,
  ROLL_PAGE_DISCRIMINANT,
  TAG_DISCRIMINANT,
} from './discriminants.js';
import type { PageUrl, UrlScheme } from './scheme.js';

/**
 * Emits the canonical form and nothing else: page one is the roll's own URL and
 * the default locale carries no prefix, so a non-canonical form is not
 * representable in the output and cannot reach a link, a sitemap or a redirect
 * target (R-URLSCHEME-21).
 */
export function buildUrl(scheme: UrlScheme, page: PageUrl): string {
  const prefix =
    page.locale === scheme.defaultLocale
      ? ''
      : `/${LOCALE_DISCRIMINANT}/${page.locale}`;

  if (page.kind === 'landing') {
    return prefix === '' ? '/' : prefix;
  }

  const root = `${prefix}/${scheme.contentRoot}`;

  switch (page.kind) {
    case 'blog-home':
      return `${root}${rollSuffix(page.page)}`;
    case 'category':
      return `${root}/${CATEGORY_DISCRIMINANT}/${page.category}${rollSuffix(page.page)}`;
    case 'tag':
      return `${root}/${TAG_DISCRIMINANT}/${page.tag}${rollSuffix(page.page)}`;
    case 'article':
      return page.category === undefined
        ? `${root}/${page.slug}`
        : `${root}/${CATEGORY_DISCRIMINANT}/${page.category}/${page.slug}`;
  }
}

function rollSuffix(page: number): string {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error(`A roll page is an integer of at least 1, got ${page}`);
  }
  return page === 1 ? '' : `/${ROLL_PAGE_DISCRIMINANT}/${page}`;
}
