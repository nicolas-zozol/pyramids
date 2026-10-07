/**
 * Package page-data — the only path from a route to the content source: two
 * server functions that run at prerender and reach a hydrated page as files.
 *
 * Design: features/pyramid-v2-epic/migrate-learn-content/migrate-learn-content.design.md
 * Requirements: R-MIGRATELEARN-44
 * Design: features/pyramid-v2-epic/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-61, R-TANSTACK-62, R-TANSTACK-63, R-TANSTACK-65
 */
import { createServerFn } from '@tanstack/react-start';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';
import { articlePage } from './article-page.js';
import { notesFeed } from './notes-feed.js';
import type { ArticleKey, NotesFeedRequest, PageData } from './types.js';

export type {
  ArticleKey,
  ArticlePage,
  NotesFeedRequest,
  PageData,
  TranslationLink,
} from './types.js';

/** One article page, written to a data file per key at prerender. */
export const getArticlePage: PageData['getArticlePage'] = createServerFn({
  method: 'GET',
})
  .validator(articleKey)
  .middleware([staticFunctionMiddleware])
  .handler(({ data }) => articlePage(data));

/** The notes section's posts, written to a data file per request at prerender. */
export const getNotesFeed: PageData['getNotesFeed'] = createServerFn({
  method: 'GET',
})
  .validator(notesFeedRequest)
  .middleware([staticFunctionMiddleware])
  .handler(({ data }) => notesFeed(data));

function articleKey(input: ArticleKey): ArticleKey {
  if (typeof input?.locale !== 'string' || typeof input?.slug !== 'string') {
    throw new Error(
      `An article key names a locale and a slug: ${JSON.stringify(input)}`,
    );
  }
  return { locale: input.locale, slug: input.slug };
}

function notesFeedRequest(input: NotesFeedRequest): NotesFeedRequest {
  if (typeof input?.locale !== 'string' || !Number.isInteger(input?.limit)) {
    throw new Error(
      `A notes feed request names a locale and a whole limit: ${JSON.stringify(input)}`,
    );
  }
  return { locale: input.locale, limit: input.limit };
}
