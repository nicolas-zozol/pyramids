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
