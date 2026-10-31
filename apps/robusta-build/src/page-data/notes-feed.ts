import type { NotePost } from '@robusta/pyramids-design-system';
import {
  getArticleIndex,
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
