import { LOCALES, urlScheme } from '../routing/scheme.ts';
import { buildUrl } from '../routing/url-scheme/index.ts';
import { pageHead, type RouteHead } from '../seo/index.ts';
import { getPageCopy } from '../seopyramids.config.ts';

/** rbCompound.head of the Locale, indexable, the page in the two other Locales as versions. */
export function rbCompoundHead(locale: string): RouteHead {
  const { title, description } = getPageCopy(locale).rbCompound.head;

  return pageHead({
    locale,
    url: rbCompoundUrl(locale),
    title,
    description,
    indexable: true,
    versions: LOCALES.filter((other) => other !== locale).map((other) => ({
      locale: other,
      url: rbCompoundUrl(other),
    })),
    structuredData: [],
  });
}

/** The URL of the page of RB Compound in a Locale. */
export function rbCompoundUrl(locale: string): string {
  return buildUrl(urlScheme, {
    kind: 'product',
    locale,
    product: 'rb-compound',
  });
}
