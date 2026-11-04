/** Another version of a page: its Locale and its root-relative canonical path. */
export interface PageVersion {
  locale: string;
  url: string;
}

/** One step of a breadcrumb trail; `url` is absent on the current page. */
export interface Crumb {
  label: string;
  url?: string;
}

export type StructuredValue =
  | string
  | number
  | boolean
  | StructuredValue[]
  | StructuredObject;

export interface StructuredObject {
  [field: string]: StructuredValue;
}

/** A schema.org block, written in the head as JSON-LD. */
export interface StructuredData extends StructuredObject {
  '@context': 'https://schema.org';
  '@type': string;
}

/** What a page declares of itself; `pageHead` turns it into the head of its route. */
export interface PageDeclaration {
  locale: string;
  /** Root-relative canonical path, from buildUrl. */
  url: string;
  title: string;
  description: string;
  indexable: boolean;
  /** The other indexable versions of the page, itself excluded. */
  versions: PageVersion[];
  /** A path under the asset root; absent when the page has no image of its own. */
  image?: string;
  structuredData: StructuredData[];
  /** `og:type`; `website` when absent. */
  shareType?: 'article' | 'website';
}

export type HeadMeta =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };

export interface HeadLink {
  rel: string;
  href: string;
  hrefLang?: string;
}

/** A structured data block, serialized for a `<script type="application/ld+json">`. */
export interface HeadScript {
  type: 'application/ld+json';
  children: string;
}

/** The shape a TanStack route's head returns. */
export interface RouteHead {
  meta: HeadMeta[];
  links: HeadLink[];
  scripts: HeadScript[];
}

export interface SitemapEntry {
  loc: string;
  /** `YYYY-MM-DD`. */
  lastmod?: string;
}
