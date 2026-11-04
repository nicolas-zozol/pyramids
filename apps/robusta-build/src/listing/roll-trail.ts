import type { RollPage } from '../page-data/index.ts';
import { urlScheme } from '../routing/scheme.ts';
import { buildUrl, type RollUrl } from '../routing/url-scheme/index.ts';
import type { Crumb } from '../seo/index.ts';
import { getCategoryLabel, getPageCopy } from '../seopyramids.config.ts';

/** A Category roll: blog home, then the Category, linked from page 2 on; a blog home: none. */
export function rollTrail(roll: RollPage, page: RollUrl): Crumb[] {
  if (page.kind === 'blog-home') {
    return [];
  }
  const { locale } = roll;
  const label = getCategoryLabel(locale, page.category);
  return [
    {
      label: getPageCopy(locale).listing.blogTitle,
      url: buildUrl(urlScheme, { kind: 'blog-home', locale, page: 1 }),
    },
    page.page === 1
      ? { label }
      : { label, url: buildUrl(urlScheme, { ...page, page: 1 }) },
  ];
}
