import {
  CATEGORY_DISCRIMINANT,
  ROLL_PAGE_DISCRIMINANT,
  TAG_DISCRIMINANT,
} from './discriminants.ts';
import type { PageUrl, UrlScheme } from './scheme.ts';

/**
 * Emits the canonical form and nothing else: the default locale carries no
 * marker (BR-PYRAMID-14), its landing is `/` and its content `/{contentRoot}…`;
 * another locale is `/{locale}` and `/{locale}/{contentRoot}…`; page one is the
 * roll's own URL. A non-canonical form is not representable in the output and
 * cannot reach a link, a sitemap or a redirect target.
 */
export function buildUrl(scheme: UrlScheme, page: PageUrl): string {
  const prefix = page.locale === scheme.defaultLocale ? '' : `/${page.locale}`;

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
