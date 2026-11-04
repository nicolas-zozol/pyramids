import type { RollUrl } from '../routing/url-scheme/index.ts';
import { getCategoryLabel, getPageCopy } from '../seopyramids.config.ts';

export interface ListingHead {
  meta: [{ title: string }, { name: 'description'; content: string }];
}

/** The route head: title and description from the head model of the page's Locale and kind, filled with the Category label and, from page 2, the page number. */
export function listingHead(page: RollUrl): ListingHead {
  const { head } = getPageCopy(page.locale).listing;
  const model = page.kind === 'blog-home' ? head.blogHome : head.category;
  const label =
    page.kind === 'category'
      ? getCategoryLabel(page.locale, page.category)
      : undefined;
  const suffix =
    page.page > 1 ? head.pageSuffix.replace('{page}', String(page.page)) : '';
  const filled = (template: string) =>
    `${label === undefined ? template : template.replace('{category}', label)}${suffix}`;

  return {
    meta: [
      { title: filled(model.title) },
      { name: 'description', content: filled(model.description) },
    ],
  };
}
