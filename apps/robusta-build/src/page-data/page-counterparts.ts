import { getArticleIndex } from '../content/article-index.js';
import { contentUrls } from '../routing/content-urls.js';
import { counterpartsOf } from '../routing/counterparts.js';
import { urlScheme } from '../routing/scheme.js';
import { landingPages, type PageUrl } from '../routing/url-scheme/index.js';

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
