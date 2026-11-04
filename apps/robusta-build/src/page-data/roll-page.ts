import type { NotePost } from '@robusta/pyramids-design-system';
import {
  getArticleIndex,
  type ArticleIndexEntry,
} from '../content/article-index.ts';
import { contentUrls } from '../routing/content-urls.ts';
import { versionsOf } from '../routing/counterparts.ts';
import { articlesListedBy } from '../routing/listed-articles.ts';
import { urlScheme } from '../routing/scheme.ts';
import {
  buildUrl,
  type PageUrl,
  type RollUrl,
} from '../routing/url-scheme/index.ts';
import { isIndexable, type PageVersion } from '../seo/index.ts';
import { articleUrl } from './article-url.ts';
import type { RollPage } from './types.ts';

/** One page of a roll, read from the article index and the URL set at build. */
export async function rollPage(page: RollUrl): Promise<RollPage> {
  const [articles, urls] = await Promise.all([
    getArticleIndex(),
    contentUrls(),
  ]);
  return rollPageOf(page, articles, urls);
}

/** One page of a roll among `articles`, newest first as the index gives them; its neighbours and its versions read in `urls`. Throws naming the page when `urls` does not hold it. */
export function rollPageOf(
  page: RollUrl,
  articles: readonly ArticleIndexEntry[],
  urls: readonly PageUrl[],
): RollPage {
  const built = new Set(urls.map((url) => buildUrl(urlScheme, url)));
  const urlOf = (n: number): string | undefined => {
    if (n < 1) return undefined;
    const url = buildUrl(urlScheme, { ...page, page: n });
    return built.has(url) ? url : undefined;
  };

  if (urlOf(page.page) === undefined) {
    throw new Error(`The URL set holds no roll page ${JSON.stringify(page)}`);
  }

  const previousUrl = urlOf(page.page - 1);
  const nextUrl = urlOf(page.page + 1);
  const indexable = isIndexable(page, articles);

  return {
    locale: page.locale,
    ...(page.kind === 'category' ? { category: page.category } : {}),
    indexable,
    versions: indexable ? indexableVersions(page, articles, urls) : [],
    posts: articlesListedBy(page, articles).map((article) =>
      rollPost(article, page.kind === 'blog-home'),
    ),
    ...(previousUrl === undefined ? {} : { previousUrl }),
    ...(nextUrl === undefined ? {} : { nextUrl }),
  };
}

function indexableVersions(
  page: RollUrl,
  articles: readonly ArticleIndexEntry[],
  urls: readonly PageUrl[],
): PageVersion[] {
  return versionsOf(page, urls, articles)
    .filter((version) => isIndexable(version, articles))
    .map((version) => ({
      locale: version.locale,
      url: buildUrl(urlScheme, version),
    }));
}

function rollPost(article: ArticleIndexEntry, tagged: boolean): NotePost {
  return {
    title: article.title,
    href: articleUrl(article),
    ...(tagged && article.category !== undefined
      ? { tag: article.category }
      : {}),
    date: dateWithYear(article.date, article.locale),
  };
}

function dateWithYear(date: string, locale: string): string {
  // Formatted in UTC from the calendar date: the build machine's zone would move it by one.
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}
