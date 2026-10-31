import { getArticleIndex } from '../content/article-index.ts';
import { contentUrls } from '../routing/content-urls.ts';
import { counterpartsOf } from '../routing/counterparts.ts';
import { urlScheme } from '../routing/scheme.ts';
import { landingPages, type PageUrl } from '../routing/url-scheme/index.ts';

/** The counterparts of one page among the landing pages and the content URLs, read from the article index at build. */
export async function pageCounterparts(page: PageUrl): Promise<PageUrl[]> {
  const [content, articles] = await Promise.all([
    contentUrls(),
    getArticleIndex(),
  ]);
  return counterpartsOf(
    page,
    [...landingPages(urlScheme), ...content],
    articles,
  );
}
