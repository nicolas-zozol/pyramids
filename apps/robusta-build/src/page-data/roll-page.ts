import type { NotePost } from '@robusta/pyramids-design-system';
import {
  getArticleIndex,
  type ArticleIndexEntry,
} from '../content/article-index.ts';
import { contentUrls } from '../routing/content-urls.ts';
import { urlScheme } from '../routing/scheme.ts';
import {
  buildUrl,
  type PageUrl,
  type RollUrl,
} from '../routing/url-scheme/index.ts';
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

/** One page of a roll among `articles`, newest first as the index gives them; its neighbours read in `urls`. Throws naming the page when `urls` does not hold it. */
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

  const { rollSize } = urlScheme;
  const start = (page.page - 1) * rollSize;
  const previousUrl = urlOf(page.page - 1);
  const nextUrl = urlOf(page.page + 1);

  return {
    locale: page.locale,
    ...(page.kind === 'category' ? { category: page.category } : {}),
    posts: articles
      .filter((article) => inRoll(article, page))
      .slice(start, start + rollSize)
      .map((article) => rollPost(article, page.kind === 'blog-home')),
    ...(previousUrl === undefined ? {} : { previousUrl }),
    ...(nextUrl === undefined ? {} : { nextUrl }),
  };
}

function inRoll(article: ArticleIndexEntry, page: RollUrl): boolean {
  return (
    article.locale === page.locale &&
    (page.kind === 'blog-home' || article.category === page.category)
  );
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
