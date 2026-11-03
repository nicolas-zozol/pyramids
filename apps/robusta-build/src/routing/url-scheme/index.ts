/**
 * Package url-scheme — the v2 URL scheme as pure string functions: the
 * discriminants, the canonical builder, the parser, the Locale of a route
 * segment, the URL set.
 *
 * Design: features/pyramid-v2-epic/default-locale-at-root/default-locale-at-root.design.md
 * Requirements: R-ROOTLOCALE-01, R-ROOTLOCALE-02, R-ROOTLOCALE-03
 * Design: features/pyramid-v2-epic/multilingual-site/multilingual-site.design.md
 * Requirements: R-MULTILINGUAL-01, R-MULTILINGUAL-02, R-MULTILINGUAL-05, R-MULTILINGUAL-21, R-MULTILINGUAL-22, R-MULTILINGUAL-23
 * Design: features/pyramid-v2-epic/__done/seo-url-scheme/seo-url-scheme.design.md
 * Requirements: R-URLSCHEME-1, R-URLSCHEME-2, R-URLSCHEME-3, R-URLSCHEME-4, R-URLSCHEME-6, R-URLSCHEME-7, R-URLSCHEME-8, R-URLSCHEME-10, R-URLSCHEME-11, R-URLSCHEME-12, R-URLSCHEME-21, R-URLSCHEME-22, R-URLSCHEME-31
 */
export {
  CATEGORY_DISCRIMINANT,
  RESERVED_SEGMENTS,
  ROLL_PAGE_DISCRIMINANT,
  TAG_DISCRIMINANT,
  isReservedSegment,
} from './discriminants.ts';

export type {
  AddressableArticle,
  PageUrl,
  SchemeViolation,
  UrlScheme,
} from './scheme.ts';

export { buildUrl } from './build-url.ts';
export { localeOfSegment } from './locale-of-segment.ts';
export { parseUrl } from './parse-url.ts';
export { landingPages, urlSet } from './url-set.ts';
export { validateArticles } from './validate-articles.ts';
