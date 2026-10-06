import type { NotePost } from '@robusta/pyramids-design-system';
import type { ArticleIndexEntry } from '../content/article-index.js';

export interface ArticleKey {
  locale: string;
  slug: string;
}

export interface TranslationLink {
  url: string;
  locale: string;
  /** The language naming itself, computed at build. */
  label: string;
}

export interface ArticlePage {
  article: ArticleIndexEntry;
  /** The body, every reference resolved. */
  html: string;
  /** Absent when the article declares no cover. */
  coverUrl?: string;
  /** Absent when the article claims no category. */
  categoryUrl?: string;
  /** Absent when no published pair exists. */
  translation?: TranslationLink;
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
}
