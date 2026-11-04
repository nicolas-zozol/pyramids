import type { NotePost } from '@robusta/pyramids-design-system';
import type { ArticleIndexEntry } from '../content/article-index.ts';
import type { PageUrl, RollUrl } from '../routing/url-scheme/index.ts';

export interface ArticleKey {
  locale: string;
  slug: string;
}

export interface ArticleVersion {
  locale: string;
  url: string;
}

export interface ArticlePage {
  article: ArticleIndexEntry;
  /** The body, every reference resolved. */
  html: string;
  /** Absent when the article declares no cover. */
  coverUrl?: string;
  /** Absent when the article claims no category. */
  categoryUrl?: string;
  /** Every other published version of the article, in the order of the scheme's Locales. */
  versions: ArticleVersion[];
  /** The date as the article's locale writes it, computed at build. */
  writtenDate: string;
}

export interface NotesFeedRequest {
  locale: string;
  limit: number;
}

export interface LocaleRequest {
  locale: string;
}

/** One page of a roll, every URL built and every date written at build. */
export interface RollPage {
  locale: string;
  /** Absent on a blog home. */
  category?: string;
  /** Newest first, ROLL_SIZE at most. */
  posts: NotePost[];
  /** Absent on the first page; on page 2, the first page, without /p/. */
  previousUrl?: string;
  /** Absent on the last page. */
  nextUrl?: string;
}

export interface PageData {
  /** At build, throws naming the key when no article matches. On the deploy,
   *  rejects when the build wrote no file for that key. */
  getArticlePage(call: { data: ArticleKey }): Promise<ArticlePage>;
  /** The newest published articles of one locale, newest first. */
  getNotesFeed(call: { data: NotesFeedRequest }): Promise<NotePost[]>;
  /** The same page in each other Locale that has it, among the landing pages and the content URLs. */
  getCounterparts(call: { data: PageUrl }): Promise<PageUrl[]>;
  /** One page of a roll, a data file per page at prerender. At build, throws naming the page when the URL set does not hold it. */
  getRollPage(call: { data: RollUrl }): Promise<RollPage>;
  /** The first page of each roll of a Locale, blog home first; empty when the Locale publishes no article. A data file per Locale. */
  getLocaleRolls(call: { data: LocaleRequest }): Promise<RollUrl[]>;
}
