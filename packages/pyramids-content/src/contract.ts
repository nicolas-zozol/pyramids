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

/** What a site declares about its own tree. Data — the base calls back into nothing. */
export interface CorpusSpec {
  /** Directory holding the articles, relative to the process working directory. */
  root: string;
  localeFrom: LocaleSource;
  /** Path suffixes that are not articles — `.brief.md`, `example.md`. */
  exclude?: readonly string[];
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
  | { code: 'duplicate-translation-id'; path: string; translationId: string; locale: string };

export interface CorpusRead {
  /** Published, valid, newest first. */
  articles: readonly ArticleEntry[];
  violations: readonly CorpusViolation[];
  /** Paths of the files read and left out for want of `published: true`. */
  unpublished: readonly string[];
}
