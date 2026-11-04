/**
 * Package page-data — the only path from a route to the content source: five
 * server functions that run at prerender and reach a hydrated page as files.
 *
 * Design: features/pyramid-v2-epic/migrate-learn-content/migrate-learn-content.design.md
 * Requirements: R-MIGRATELEARN-44
 * Design: features/pyramid-v2-epic/__done/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-61, R-TANSTACK-62, R-TANSTACK-63, R-TANSTACK-65
 * Design: features/pyramid-v2-epic/robusta-landing-page/robusta-landing-page.design.md
 * Requirements: R-LANDING-86
 * Design: features/pyramid-v2-epic/multilingual-site/multilingual-site.design.md
 * Requirements: R-MULTILINGUAL-62, R-MULTILINGUAL-64
 * Design: features/pyramid-v2-epic/blog-rolls/blog-rolls.design.md
 * Requirements: R-BLOGROLLS-02, R-BLOGROLLS-03, R-BLOGROLLS-04, R-BLOGROLLS-05, R-BLOGROLLS-06
 * Design: features/pyramid-v2-epic/seo-excellence/seo-excellence.design.md
 * Requirements: R-SEOEXCELLENCE-02, R-SEOEXCELLENCE-22, R-SEOEXCELLENCE-65, R-SEOEXCELLENCE-81
 */
import { createServerFn } from '@tanstack/react-start';
import { staticFunctionMiddleware } from '@tanstack/start-static-server-functions';
import { articlePage } from './article-page.ts';
import { notesFeed } from './notes-feed.ts';
import { localeRolls } from './locale-rolls.ts';
import { pageCounterparts } from './page-counterparts.ts';
import { rollPage } from './roll-page.ts';
import { localeRequest, rollUrl } from './validators.ts';
import type { PageUrl } from '../routing/url-scheme/index.ts';
import type { ArticleKey, NotesFeedRequest, PageData } from './types.ts';

export type {
  ArticleKey,
  ArticlePage,
  ArticleVersion,
  LocaleRequest,
  NotesFeedRequest,
  PageData,
  RelatedArticle,
  RollPage,
} from './types.ts';

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

/** The counterparts of one page, written to a data file per page at prerender. */
export const getCounterparts: PageData['getCounterparts'] = createServerFn({
  method: 'GET',
})
  .validator(pageUrl)
  .middleware([staticFunctionMiddleware])
  .handler(({ data }) => pageCounterparts(data));

/** One page of a roll, written to a data file per page at prerender. */
export const getRollPage: PageData['getRollPage'] = createServerFn({
  method: 'GET',
})
  .validator(rollUrl)
  .middleware([staticFunctionMiddleware])
  .handler(({ data }) => rollPage(data));

/** The first page of each roll of a Locale, written to a data file per Locale at prerender. */
export const getLocaleRolls: PageData['getLocaleRolls'] = createServerFn({
  method: 'GET',
})
  .validator(localeRequest)
  .middleware([staticFunctionMiddleware])
  .handler(({ data }) => localeRolls(data));

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

function pageUrl(input: PageUrl): PageUrl {
  if (typeof input?.kind !== 'string' || typeof input?.locale !== 'string') {
    throw new Error(
      `A page URL names a kind and a locale: ${JSON.stringify(input)}`,
    );
  }
  return input;
}
