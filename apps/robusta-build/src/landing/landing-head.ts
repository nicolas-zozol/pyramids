import { LOCALES, urlScheme } from '../routing/scheme.ts';
import { buildUrl } from '../routing/url-scheme/index.ts';
import {
  absoluteUrl,
  organizationData,
  pageHead,
  type RouteHead,
} from '../seo/index.ts';
import { getPageCopy, getSeoPyramidsConfig } from '../seopyramids.config.ts';

/** landing.head of the Locale, indexable, the two other landing pages as versions, the Organization. */
export function landingHead(locale: string): RouteHead {
  const { siteName, contact } = getSeoPyramidsConfig();
  const { title, description } = getPageCopy(locale).landing.head;
  const url = landingUrl(locale);

  return pageHead({
    locale,
    url,
    title,
    description,
    indexable: true,
    versions: LOCALES.filter((other) => other !== locale).map((other) => ({
      locale: other,
      url: landingUrl(other),
    })),
    structuredData: [
      organizationData(siteName, absoluteUrl(url), contact.email, [
        contact.linkedIn,
      ]),
    ],
  });
}

function landingUrl(locale: string): string {
  return buildUrl(urlScheme, { kind: 'landing', locale });
}
