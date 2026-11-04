import type { ArticleIndexEntry } from '../content/article-index.ts';
import type { Crumb, StructuredData } from './declaration.ts';
import { absoluteUrl } from './page-head.ts';

const CONTEXT = 'https://schema.org';

/** BlogPosting; dateModified only when the entry declares `updated`. */
export function articleData(
  entry: ArticleIndexEntry,
  coverUrl?: string,
): StructuredData {
  return {
    '@context': CONTEXT,
    '@type': 'BlogPosting',
    headline: entry.title,
    datePublished: entry.date,
    ...(entry.updated === undefined ? {} : { dateModified: entry.updated }),
    author: { '@type': 'Person', name: entry.author },
    inLanguage: entry.locale,
    ...(coverUrl === undefined ? {} : { image: absoluteUrl(coverUrl) }),
  };
}

/** BreadcrumbList; `item` only on the crumbs that carry a url. */
export function breadcrumbData(trail: Crumb[]): StructuredData {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      ...(crumb.url === undefined ? {} : { item: absoluteUrl(crumb.url) }),
    })),
  };
}

/** Organization: name, url, email, sameAs. */
export function organizationData(
  name: string,
  url: string,
  email: string,
  profiles: string[],
): StructuredData {
  return {
    '@context': CONTEXT,
    '@type': 'Organization',
    name,
    url,
    email,
    sameAs: profiles,
  };
}
