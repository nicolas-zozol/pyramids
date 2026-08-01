import { buildUrl } from '@robusta/pyramids-routing';
import type { NotePost } from '@robusta/pyramids-design-system';
import {
  getArticleIndex,
  type ArticleIndexEntry,
} from '../content/article-index.js';
import { urlScheme } from '../routing/scheme.js';

/**
 * The landing page's notes section takes its posts from the site's published
 * articles (R-MIGRATELEARN-44). `NotesPreview` ships four `DEFAULT_POSTS` and
 * default headings, which are page copy in a design system and must never reach
 * a served page (BR-PYRAMID-8) — so this module and `NotesSection.tsx` supply
 * every string the section renders.
 *
 * It sits outside `src/content` on purpose: `tsconfig.routing.json` includes
 * that directory whole, and anything it compiles must not reach the design
 * system — the same constraint that keeps `seopyramids.config.ts` out of the
 * emitter's reach, for the same bundler-only wordmark PNG. `src/landing` also
 * names what `robusta-landing-page` takes over.
 *
 * The index is read at build time and at no other (BR-PYRAMID-7): the page that
 * mounts the section is statically generated.
 */
export async function notesFeed(
  locale: string,
  limit: number,
): Promise<NotePost[]> {
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
    href: buildUrl(urlScheme, {
      kind: 'article',
      locale: article.locale,
      ...(article.category === undefined ? {} : { category: article.category }),
      slug: article.slug,
    }),
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
