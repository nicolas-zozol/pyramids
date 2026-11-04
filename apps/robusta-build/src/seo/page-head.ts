import { LOCALES, SITE_ORIGIN } from '../routing/scheme.ts';
import type {
  HeadLink,
  HeadMeta,
  HeadScript,
  PageDeclaration,
  PageVersion,
  RouteHead,
  StructuredData,
} from './declaration.ts';
import { robotsOf } from './indexing.ts';

const OG_LOCALES: Record<string, string> = {
  en: 'en_US',
  fr: 'fr_FR',
  es: 'es_ES',
};

const X_DEFAULT_LOCALE = 'en';

/** SITE_ORIGIN followed by a root-relative path. */
export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${path}`;
}

/** Title and description always; robots, og:*, canonical, hreflang and JSON-LD on an indexable declaration only. */
export function pageHead(declaration: PageDeclaration): RouteHead {
  const { title, description } = declaration;
  const basics: HeadMeta[] = [
    { title },
    { name: 'description', content: description },
  ];
  if (!declaration.indexable) {
    return { meta: basics, links: [], scripts: [] };
  }

  const canonical = absoluteUrl(declaration.url);
  return {
    meta: [
      ...basics,
      { name: 'robots', content: robotsOf(true) },
      ...sharePreview(declaration, canonical),
    ],
    links: [{ rel: 'canonical', href: canonical }, ...alternates(declaration)],
    scripts: declaration.structuredData.map(jsonLd),
  };
}

function sharePreview(
  declaration: PageDeclaration,
  canonical: string,
): HeadMeta[] {
  return [
    { property: 'og:type', content: declaration.shareType ?? 'website' },
    { property: 'og:title', content: declaration.title },
    { property: 'og:description', content: declaration.description },
    { property: 'og:url', content: canonical },
    {
      property: 'og:locale',
      content: OG_LOCALES[declaration.locale] ?? declaration.locale,
    },
    ...(declaration.image === undefined
      ? []
      : [{ property: 'og:image', content: absoluteUrl(declaration.image) }]),
  ];
}

function alternates(declaration: PageDeclaration): HeadLink[] {
  if (declaration.versions.length === 0) {
    return [];
  }
  const all: PageVersion[] = [
    { locale: declaration.locale, url: declaration.url },
    ...declaration.versions,
  ];
  const ordered = LOCALES.flatMap((locale) =>
    all.filter((version) => version.locale === locale),
  );
  const xDefault = ordered.find(
    (version) => version.locale === X_DEFAULT_LOCALE,
  );

  return [
    ...ordered.map((version) => alternate(version.locale, version.url)),
    ...(xDefault === undefined ? [] : [alternate('x-default', xDefault.url)]),
  ];
}

function alternate(hrefLang: string, url: string): HeadLink {
  return { rel: 'alternate', hrefLang, href: absoluteUrl(url) };
}

function jsonLd(data: StructuredData): HeadScript {
  // The text lands raw inside a script element: `<` must not close it.
  return {
    type: 'application/ld+json',
    children: JSON.stringify(data)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026'),
  };
}
