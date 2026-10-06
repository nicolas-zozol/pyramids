import type { NotePost } from '@robusta/pyramids-design-system';
import {
  getArticleIndex,
  type ArticleIndexEntry,
} from '../content/article-index.js';
import { articleUrl } from './article-url.js';
import type { NotesFeedRequest } from './types.js';

/** The newest published articles of one locale as notes posts, newest first. */
export async function notesFeed({
  locale,
  limit,
}: NotesFeedRequest): Promise<NotePost[]> {
  const articles = await getArticleIndex();

  return articles
    .filter((article) => article.locale === locale)
    .slice(0, limit)
    .map(notePost);
}

/**
 * Selection ignores `featured` deliberately: the decision of 2026-07-30 leaves
 * the publisher to re-pick the featured set once someone decides what a featured
 * article is for, and newest-first is what a preview of notes means until then.
 * The index is already newest first, so the slice is the selection.
 *
 * `tagTone` is left unset so the default tone applies — assigning a tone per
 * category is a visual decision and belongs with the prose surface.
 */
function notePost(article: ArticleIndexEntry): NotePost {
  return {
    title: article.title,
    href: articleUrl(article),
    ...(article.category === undefined ? {} : { tag: article.category }),
    date: shortDate(article.date),
  };
}

const MONTHS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];

/**
 * `2021-11-30` into `nov 30`, the short lowercase form the design system's own
 * examples use. Read off the `YYYY-MM-DD` string rather than through a `Date`,
 * so no timezone can move a date by a day and no runtime locale can rename a
 * month.
 */
function shortDate(date: string): string {
  const [, month, day] = date.split('-');
  return `${MONTHS[Number(month) - 1]} ${day}`;
}
