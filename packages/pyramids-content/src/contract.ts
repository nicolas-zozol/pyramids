/**
 * The reading contract of the version 2 base, stated as data.
 *
 * It holds no site's corpus path, no content root, no category and no locale
 * value (R-CONTENTSOURCE-21): a site declares its own tree through `CorpusSpec`
 * and the base calls back into nothing (R-CONTENTSOURCE-22).
 *
 * `ArticleEntry` is structurally an `AddressableArticle` of
 * `@robusta/pyramids-routing`, which is how the two contracts meet without
 * either package importing the other.
 */

export type LocaleSource = 'frontmatter' | { pathSegment: number };

/**
 * Where a site publishes the files its articles reference. Data, like the rest
 * of `CorpusSpec`.
 *
 * The asset root is a namespace of its own, outside every shape the URL scheme
 * reserves for a page (BR-PYRAMID-1): a site that has to look at the filesystem
 * to know whether an address is a page or a file is what that rule forbids.
 */
export interface AssetSpec {
  /** Directory the copy step writes, relative to the process working directory. It owns that directory. */
  publishDir: string;
  /** The URL prefix that directory is published under. */
  urlPrefix: string;
}

/** What a site declares about its own tree. Data — the base calls back into nothing. */
export interface CorpusSpec {
  /** Directory holding the articles, relative to the process working directory. */
  root: string;
  localeFrom: LocaleSource;
  /** Path suffixes that are not articles — `.brief.md`, `example.md`. */
  exclude?: readonly string[];
  /**
   * Absent on a site that publishes no asset: the base then judges no image
   * reference and publishes no file.
   */
  assets?: AssetSpec;
}

export interface ArticleEntry {
  /** Source file, relative to the corpus root: what a build failure names. */
  path: string;
  slug: string;
  locale: string;
  category?: string;
  title: string;
  /** `YYYY-MM-DD`. */
  date: string;
  tags: readonly string[];
  excerpt: string;
  /** As declared in the frontmatter, unresolved. */
  image?: string;
  translationId?: string;
}

export interface ArticleBody {
  html: string;
}

export type CorpusViolation =
  | { code: 'missing-corpus-root'; root: string }
  | { code: 'unreadable-frontmatter'; path: string; detail: string }
  | { code: 'missing-field'; path: string; field: 'title' | 'date' | 'locale' | 'excerpt' }
  | { code: 'malformed-date'; path: string; date: string }
  | { code: 'non-boolean-published'; path: string; value: string }
  | { code: 'duplicate-translation-id'; path: string; translationId: string; locale: string }
  | { code: 'unresolved-asset'; path: string; reference: string };

export interface CorpusRead {
  /** Published, valid, newest first. */
  articles: readonly ArticleEntry[];
  violations: readonly CorpusViolation[];
  /** Paths of the files read and left out for want of `published: true`. */
  unpublished: readonly string[];
}
