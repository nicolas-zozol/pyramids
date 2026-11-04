import { describe, expect, it } from 'vitest';
import {
  absoluteUrl,
  pageHead,
  type HeadMeta,
  type PageDeclaration,
  type RouteHead,
} from './index.ts';

const quitterGmail: PageDeclaration = {
  locale: 'fr',
  url: '/fr/articles/c/privacy/quitter-gmail',
  title: 'Quitter Gmail',
  description: 'GMail était une révolution en 2004.',
  indexable: true,
  versions: [{ locale: 'en', url: '/articles/c/privacy/leaving-gmail' }],
  structuredData: [],
};

const metaNamed = (head: RouteHead, key: string): string | undefined => {
  const tag = head.meta.find(
    (meta) =>
      ('name' in meta && meta.name === key) ||
      ('property' in meta && meta.property === key),
  ) as { content?: string } | undefined;
  return tag?.content;
};

const keysOf = (meta: HeadMeta[]): string[] =>
  meta.map((tag) =>
    'title' in tag ? 'title' : 'name' in tag ? tag.name : tag.property,
  );

const alternates = (head: RouteHead) =>
  head.links
    .filter((link) => link.rel === 'alternate')
    .map((link) => [link.hrefLang, link.href]);

// R-SEOEXCELLENCE-03: a canonical URL is the scheme's form on SITE_ORIGIN.
describe('absoluteUrl', () => {
  it('prefixes a root-relative path with the origin of the site', () => {
    expect(absoluteUrl('/fr/articles')).toBe(
      'https://www.robusta.build/fr/articles',
    );
    expect(absoluteUrl('/')).toBe('https://www.robusta.build/');
  });
});

// R-SEOEXCELLENCE-01, 03, 04, 05 and 23; AC-SEOEXCELLENCE-1, 2 and 7.
describe('pageHead', () => {
  it('declares title, description, robots, then the share preview, in this order', () => {
    expect(keysOf(pageHead(quitterGmail).meta)).toEqual([
      'title',
      'description',
      'robots',
      'og:type',
      'og:title',
      'og:description',
      'og:url',
      'og:locale',
    ]);
  });

  it('keeps every indexable page closed to indexation until go-live', () => {
    expect(metaNamed(pageHead(quitterGmail), 'robots')).toBe(
      'noindex, nofollow',
    );
  });

  it('builds the share preview on the title, the description and the canonical URL, og:locale from the Locale', () => {
    const head = pageHead(quitterGmail);

    expect(head.meta[0]).toEqual({ title: 'Quitter Gmail' });
    expect(metaNamed(head, 'description')).toBe(quitterGmail.description);
    expect(metaNamed(head, 'og:type')).toBe('website');
    expect(metaNamed(head, 'og:title')).toBe('Quitter Gmail');
    expect(metaNamed(head, 'og:description')).toBe(quitterGmail.description);
    expect(metaNamed(head, 'og:url')).toBe(
      'https://www.robusta.build/fr/articles/c/privacy/quitter-gmail',
    );
    expect(metaNamed(head, 'og:locale')).toBe('fr_FR');
    expect(
      metaNamed(
        pageHead({ ...quitterGmail, locale: 'en', url: '/' }),
        'og:locale',
      ),
    ).toBe('en_US');
    expect(
      metaNamed(
        pageHead({ ...quitterGmail, locale: 'es', url: '/es' }),
        'og:locale',
      ),
    ).toBe('es_ES');
  });

  it('types an article page as an article', () => {
    expect(
      metaNamed(pageHead({ ...quitterGmail, shareType: 'article' }), 'og:type'),
    ).toBe('article');
  });

  it('shares an image only when the page has one of its own, absolute', () => {
    expect(metaNamed(pageHead(quitterGmail), 'og:image')).toBeUndefined();
    expect(
      metaNamed(
        pageHead({
          ...quitterGmail,
          image: '/article-images/privacy/images/gmail.png',
        }),
        'og:image',
      ),
    ).toBe('https://www.robusta.build/article-images/privacy/images/gmail.png');
  });

  it('links the canonical URL, then one alternate per Locale, the page included, then the x-default on the en version', () => {
    const head = pageHead(quitterGmail);

    expect(head.links[0]).toEqual({
      rel: 'canonical',
      href: 'https://www.robusta.build/fr/articles/c/privacy/quitter-gmail',
    });
    expect(alternates(head)).toEqual([
      ['en', 'https://www.robusta.build/articles/c/privacy/leaving-gmail'],
      ['fr', 'https://www.robusta.build/fr/articles/c/privacy/quitter-gmail'],
      [
        'x-default',
        'https://www.robusta.build/articles/c/privacy/leaving-gmail',
      ],
    ]);
  });

  it('points the x-default of an en page at the page itself, and lists the Locales in the order of the scheme', () => {
    const head = pageHead({
      ...quitterGmail,
      locale: 'en',
      url: '/',
      versions: [
        { locale: 'es', url: '/es' },
        { locale: 'fr', url: '/fr' },
      ],
    });

    expect(alternates(head)).toEqual([
      ['en', 'https://www.robusta.build/'],
      ['fr', 'https://www.robusta.build/fr'],
      ['es', 'https://www.robusta.build/es'],
      ['x-default', 'https://www.robusta.build/'],
    ]);
  });

  it('declares no x-default on a page without an en version, and no alternate on a page without version', () => {
    const withoutEnglish = pageHead({
      ...quitterGmail,
      versions: [{ locale: 'es', url: '/es/articles/c/privacy/dejar-gmail' }],
    });

    expect(alternates(withoutEnglish).map(([lang]) => lang)).toEqual([
      'fr',
      'es',
    ]);
    expect(alternates(pageHead({ ...quitterGmail, versions: [] }))).toEqual([]);
  });

  it('writes each structured data block as a JSON-LD script', () => {
    const data = {
      '@context': 'https://schema.org' as const,
      '@type': 'Thing',
      name: 'A',
    };
    const { scripts } = pageHead({ ...quitterGmail, structuredData: [data] });

    expect(scripts).toEqual([
      { type: 'application/ld+json', children: JSON.stringify(data) },
    ]);
  });

  it('escapes in a JSON-LD script what would close it, the JSON staying the same', () => {
    const data = {
      '@context': 'https://schema.org' as const,
      '@type': 'Thing',
      name: '</script><b>&',
    };
    const [script] = pageHead({
      ...quitterGmail,
      structuredData: [data],
    }).scripts;

    expect(script.children).not.toMatch(/[<>&]/);
    expect(JSON.parse(script.children)).toEqual(data);
  });

  it('declares only the title and the description of a page that is not indexable', () => {
    const head = pageHead({
      ...quitterGmail,
      indexable: false,
      image: '/article-images/a.png',
      structuredData: [{ '@context': 'https://schema.org', '@type': 'Thing' }],
    });

    expect(head).toEqual({
      meta: [
        { title: 'Quitter Gmail' },
        { name: 'description', content: quitterGmail.description },
      ],
      links: [],
      scripts: [],
    });
  });

  it('declares no keyword and no twitter card', () => {
    const keys = keysOf(pageHead({ ...quitterGmail, image: '/a.png' }).meta);

    expect(keys).not.toContain('keywords');
    expect(keys.filter((key) => key.startsWith('twitter:'))).toEqual([]);
  });
});
