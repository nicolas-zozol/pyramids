/**
 * Package seo — what each page declares of itself to a search engine: its head, its structured data, its indexability, the sitemap and robots.txt.
 *
 * Design: features/pyramid-v2-epic/seo-excellence/seo-excellence.design.md
 * Requirements: R-SEOEXCELLENCE-01, R-SEOEXCELLENCE-03, R-SEOEXCELLENCE-04, R-SEOEXCELLENCE-05, R-SEOEXCELLENCE-21, R-SEOEXCELLENCE-23, R-SEOEXCELLENCE-25, R-SEOEXCELLENCE-41, R-SEOEXCELLENCE-42, R-SEOEXCELLENCE-43, R-SEOEXCELLENCE-61, R-SEOEXCELLENCE-64
 */
export type {
  Crumb,
  HeadLink,
  HeadMeta,
  HeadScript,
  PageDeclaration,
  PageVersion,
  RouteHead,
  SitemapEntry,
  StructuredData,
} from './declaration.ts';

export { INDEXING_OPEN, isIndexable, robotsOf } from './indexing.ts';
export { absoluteUrl, pageHead } from './page-head.ts';
export { robotsTxt, sitemapEntries, sitemapXml } from './sitemap.ts';
export {
  articleData,
  breadcrumbData,
  organizationData,
} from './structured-data.ts';
