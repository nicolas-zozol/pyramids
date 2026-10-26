export interface UrlScheme {
  contentRoot: string;
  defaultLocale: string;
  otherLocales: readonly string[];
  /** The site supplies its constant; the parameter keeps the derivation testable at any value. */
  rollSize: number;
}

export type PageUrl =
  | { kind: 'landing'; locale: string }
  | { kind: 'blog-home'; locale: string; page: number }
  | { kind: 'category'; locale: string; category: string; page: number }
  | { kind: 'tag'; locale: string; tag: string; page: number }
  | { kind: 'article'; locale: string; category?: string; slug: string };

/** BR-PYRAMID-9 stated in the type: one category at most, never a list. */
export interface AddressableArticle {
  slug: string;
  locale: string;
  category?: string;
}

export type SchemeViolation =
  | { code: 'reserved-segment'; segment: string; slug: string }
  | { code: 'duplicate-slug'; slug: string; locale: string }
  | { code: 'nested-category'; category: string; slug: string }
  | { code: 'unknown-locale'; locale: string; slug: string }
  | { code: 'non-canonical-segment'; segment: string; slug: string };

export function knownLocales(scheme: UrlScheme): readonly string[] {
  return [scheme.defaultLocale, ...scheme.otherLocales];
}
