import type { NoteDateParts, NotePost } from '@robusta/pyramids-design-system';
import {
  getArticleIndex,
  getExcerptText,
  type ArticleIndexEntry,
} from '../content/article-index.ts';
import { articleUrl } from './article-url.ts';
import type { NotesFeedRequest } from './types.ts';

/** The newest published articles of one locale as notes posts, newest first, each date written as that locale writes it. */
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
    date: shortDate(article.date, article.locale),
    dateParts: dateParts(article.date, article.locale),
    summary: summaryOf(getExcerptText(article)),
  };
}

/** About two lines of a note card. */
const SUMMARY_LENGTH = 140;

/** The excerpt cut at the last word before SUMMARY_LENGTH characters, an ellipsis marking the cut. */
function summaryOf(excerpt: string): string {
  if (excerpt.length <= SUMMARY_LENGTH) return excerpt;
  const cut = excerpt.slice(0, SUMMARY_LENGTH);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.]+$/, '')}…`;
}

/** The month, the day and the year, each written as that locale writes it on its own. */
function dateParts(date: string, locale: string): NoteDateParts {
  const day = new Date(`${date}T00:00:00Z`);
  const part = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...options, timeZone: 'UTC' }).format(
      day,
    );
  return {
    month: part({ month: 'short' }),
    day: part({ day: 'numeric' }),
    year: part({ year: 'numeric' }),
  };
}

function shortDate(date: string, locale: string): string {
  // Formatted in UTC from the calendar date: the build machine's zone would move it by one.
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}
