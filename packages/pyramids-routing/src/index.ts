/**
 * Package @robusta/pyramids-routing — the v2 URL scheme as pure string
 * functions: the discriminants, the canonical builder, the parser, the URL set.
 *
 * Design: features/pyramid-v2-epic/seo-url-scheme/seo-url-scheme.design.md
 * Requirements: R-URLSCHEME-1, R-URLSCHEME-2, R-URLSCHEME-3, R-URLSCHEME-4, R-URLSCHEME-6, R-URLSCHEME-7, R-URLSCHEME-8, R-URLSCHEME-9, R-URLSCHEME-10, R-URLSCHEME-11, R-URLSCHEME-12, R-URLSCHEME-21, R-URLSCHEME-22, R-URLSCHEME-31
 */
export {
  CATEGORY_DISCRIMINANT,
  LOCALE_DISCRIMINANT,
  RESERVED_SEGMENTS,
  ROLL_PAGE_DISCRIMINANT,
  TAG_DISCRIMINANT,
  isReservedSegment,
} from './discriminants.js';

export type {
  AddressableArticle,
  PageUrl,
  SchemeViolation,
  UrlScheme,
} from './scheme.js';

export { buildUrl } from './build-url.js';
export { parseUrl } from './parse-url.js';
export { urlSet } from './url-set.js';
export { validateArticles } from './validate-articles.js';
