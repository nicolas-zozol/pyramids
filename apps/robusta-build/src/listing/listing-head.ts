import type { RollPage } from '../page-data/index.ts';
import { urlScheme } from '../routing/scheme.ts';
import { buildUrl, type RollUrl } from '../routing/url-scheme/index.ts';
import { breadcrumbData, pageHead, type RouteHead } from '../seo/index.ts';
import { getCategoryLabel, getPageCopy } from '../seopyramids.config.ts';
import { rollTrail } from './roll-trail.ts';

/** Title and description from the head model of the page's Locale and kind, filled with the Category label and, from page 2, the page number; with its roll page, the whole declaration of that page. */
export function listingHead(page: RollUrl, roll?: RollPage): RouteHead {
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
  const trail = roll === undefined ? [] : rollTrail(roll, page);

  return pageHead({
    locale: page.locale,
    url: buildUrl(urlScheme, page),
    title: filled(model.title),
    description: filled(model.description),
    indexable: roll?.indexable ?? false,
    versions: roll?.versions ?? [],
    structuredData: trail.length === 0 ? [] : [breadcrumbData(trail)],
  });
}
