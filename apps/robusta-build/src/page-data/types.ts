import type { NotePost } from '@robusta/pyramids-design-system';
import type { ArticleIndexEntry } from '../content/article-index.js';
import type { PageUrl } from '../routing/url-scheme/index.js';

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

export interface PageData {
  /** At build, throws naming the key when no article matches. On the deploy,
   *  rejects when the build wrote no file for that key. */
  getArticlePage(call: { data: ArticleKey }): Promise<ArticlePage>;
  /** The newest published articles of one locale, newest first. */
  getNotesFeed(call: { data: NotesFeedRequest }): Promise<NotePost[]>;
  /** The same page in each other Locale that has it, among the landing pages and the content URLs. */
  getCounterparts(call: { data: PageUrl }): Promise<PageUrl[]>;
}
