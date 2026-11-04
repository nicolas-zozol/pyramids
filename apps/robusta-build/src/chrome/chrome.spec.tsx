import { describe, expect, it } from 'vitest';
import type { ArticleIndexEntry } from '../content/article-index.ts';
import { wordmarkSrc } from '../design-system/assets.ts';
import { localeRolls } from '../page-data/locale-rolls.ts';
import { pageCounterparts } from '../page-data/page-counterparts.ts';
import { counterpartsOf } from '../routing/counterparts.ts';
import { LOCALES, urlScheme } from '../routing/scheme.ts';
import {
  buildUrl,
  landingPages,
  parseUrl,
  urlSet,
  type PageUrl,
  type RollUrl,
} from '../routing/url-scheme/index.ts';
import {
  getCategoryLabel,
  getPageCopy,
  getSeoPyramidsConfig,
} from '../seopyramids.config.ts';
import { anchorsTo, hrefs, htmlText } from '../test-support/markup.ts';
import { renderInRouter } from '../test-support/render-in-router.tsx';
import { Footer, Header } from './index.ts';

const { contact } = getSeoPyramidsConfig();
const A_FRENCH_ARTICLE = '/fr/articles/c/blockchain/ledger-contre-metamask';

interface LocaleLink {
  href: string;
  lang?: string;
  hrefLang?: string;
  label: string;
}

/** The links of the header to the other Locales, in document order. */
function localeLinks(html: string): LocaleLink[] {
  return [
    ...html.matchAll(
      /(<a\b[^>]*class="sk-site-header__link"[^>]*>)([^<]*)<\/a>/g,
    ),
  ].map(([, tag, label]) => ({
    href: /\shref="([^"]*)"/.exec(tag)?.[1] ?? '',
    lang: /\slang="([^"]*)"/.exec(tag)?.[1],
    hrefLang: /\shreflang="([^"]*)"/i.exec(tag)?.[1],
    label,
  }));
}

/** The header of the page at `path`, as the root route renders it from the page's counterparts. */
async function headerAt(path: string): Promise<string> {
  const page = parseUrl(urlScheme, path);
  if (page === undefined) throw new Error(`${path} is no URL of the scheme`);
  return renderInRouter(
    <Header locale={page.locale} counterparts={await pageCounterparts(page)} />,
    path,
  );
}

const landingOf = (locale: string) =>
  buildUrl(urlScheme, { kind: 'landing', locale });

const hrefsOfLocaleLinks = async (path: string) =>
  localeLinks(await headerAt(path)).map((link) => link.href);

describe('Header', () => {
  it('is the design system’s site header, its wordmark leading to the landing page of its Locale through the router', async () => {
    for (const locale of LOCALES) {
      const landing = buildUrl(urlScheme, { kind: 'landing', locale });
      const html = await renderInRouter(
        <Header locale={locale} counterparts={[]} />,
        A_FRENCH_ARTICLE,
      );
      const [wordmark] = anchorsTo(html, landing);

      expect(html).toMatch(/<header class="sk-site-header"/);
      expect(wordmark).toContain('class="sk-site-header__brand"');
      expect(anchorsTo(html, landing)).toHaveLength(1);
      expect(html).toContain(`src="${wordmarkSrc}"`);
    }
  });

  it('carries one link per other Locale, named in its own language by its page copy, then the contact call to action of its Locale', async () => {
    for (const locale of LOCALES) {
      const others = LOCALES.filter((other) => other !== locale);
      const html = await renderInRouter(
        <Header locale={locale} counterparts={[]} />,
      );

      expect(localeLinks(html)).toEqual(
        others.map((other) => ({
          href: landingOf(other),
          lang: other,
          hrefLang: other,
          label: htmlText(getPageCopy(other).localeName),
        })),
      );
      expect(hrefs(html)).toEqual([
        landingOf(locale),
        ...others.map(landingOf),
        `mailto:${contact.email}`,
      ]);
      expect(html).toContain(
        `>${htmlText(getPageCopy(locale).header.contactLabel)}<`,
      );
    }
  });

  it('leads from leaving-gmail to quitter-gmail, and from quitter-gmail to leaving-gmail, the Spanish link to /es', async () => {
    expect(
      await hrefsOfLocaleLinks('/articles/c/privacy/leaving-gmail'),
    ).toEqual(['/fr/articles/c/privacy/quitter-gmail', '/es']);
    expect(
      await hrefsOfLocaleLinks('/fr/articles/c/privacy/quitter-gmail'),
    ).toEqual(['/articles/c/privacy/leaving-gmail', '/es']);
  });

  it('leads from theory, claimed by French articles only, to the English landing page', async () => {
    expect(await hrefsOfLocaleLinks('/fr/articles/c/theory')).toEqual([
      '/',
      '/es',
    ]);
  });

  it('leads each other Locale of a landing page to its landing page', async () => {
    expect(await hrefsOfLocaleLinks('/')).toEqual(['/fr', '/es']);
  });

  // AC-ROOTLOCALE-4: every link to an English page is its unprefixed form.
  it('leads to the English pages unprefixed, from a French Category and from the Spanish landing page', async () => {
    expect(await hrefsOfLocaleLinks('/fr/articles/c/blockchain')).toEqual([
      '/articles/c/blockchain',
      '/es',
    ]);
    expect(await hrefsOfLocaleLinks('/es')).toEqual(['/', '/fr']);
  });

  it('leads from a page of the French blog roll beyond the first to the first page of the English one', async () => {
    const french = Array.from({ length: 13 }, (_, i) =>
      fixture('fr', `article-${i + 1}`),
    );
    const articles = [...french, fixture('en', 'one-article')];
    const urls = [...landingPages(urlScheme), ...urlSet(urlScheme, articles)];
    const secondPage: PageUrl = { kind: 'blog-home', locale: 'fr', page: 2 };
    const html = await renderInRouter(
      <Header
        locale="fr"
        counterparts={counterpartsOf(secondPage, urls, articles)}
      />,
      '/fr/articles/p/2',
    );

    expect(localeLinks(html).map((link) => link.href)).toEqual([
      '/articles',
      '/es',
    ]);
  });

  it('leads each version of an article written in three Locales to the two others', async () => {
    const trio = [
      fixture('en', 'leaving-gmail', 'leaving-gmail'),
      fixture('fr', 'quitter-gmail', 'leaving-gmail'),
      fixture('es', 'dejar-gmail', 'leaving-gmail'),
    ];
    const urls = [...landingPages(urlScheme), ...urlSet(urlScheme, trio)];

    for (const version of trio) {
      const page: PageUrl = {
        kind: 'article',
        locale: version.locale,
        category: 'privacy',
        slug: version.slug,
      };
      const html = await renderInRouter(
        <Header
          locale={version.locale}
          counterparts={counterpartsOf(page, urls, trio)}
        />,
        buildUrl(urlScheme, page),
      );

      expect(localeLinks(html).map((link) => link.href)).toEqual(
        trio
          .filter((other) => other.locale !== version.locale)
          .map((other) =>
            buildUrl(urlScheme, {
              kind: 'article',
              locale: other.locale,
              category: 'privacy',
              slug: other.slug,
            }),
          ),
      );
    }
  });

  it('leads a tag page, which has no counterpart, to the landing pages', async () => {
    expect(
      await pageCounterparts({
        kind: 'tag',
        locale: 'fr',
        tag: 'css',
        page: 1,
      }),
    ).toEqual([]);
    const html = await renderInRouter(<Header locale="fr" counterparts={[]} />);

    expect(localeLinks(html).map((link) => link.href)).toEqual(['/', '/es']);
  });

  it('declares no language of its own, only its links to the other Locales carrying theirs', async () => {
    const html = await headerAt(A_FRENCH_ARTICLE);
    const withLang = [...html.matchAll(/<[^>]*\slang="[^"]*"[^>]*>/g)].map(
      ([tag]) => tag,
    );

    expect(html).toMatch(/<header class="sk-site-header"/);
    expect(withLang).toHaveLength(2);
    expect(withLang.every((tag) => tag.includes('sk-site-header__link'))).toBe(
      true,
    );
  });

  it('throws naming a Locale the site does not declare', () => {
    expect(() => Header({ locale: 'de', counterparts: [] })).toThrow(/"de"/);
  });
});

function fixture(
  locale: string,
  slug: string,
  translationId?: string,
): ArticleIndexEntry {
  return {
    path: `privacy/${slug}.md`,
    slug,
    locale,
    category: 'privacy',
    title: slug,
    date: '2024-03-05',
    author: 'Nicolas Zozol',
    tags: [],
    excerpt: 'An excerpt.',
    ...(translationId === undefined ? {} : { translationId }),
  };
}

/** The column of the footer: its title, then each item's label and href, in document order. */
function footerColumns(html: string): { title: string; items: string[][] }[] {
  return [
    ...html.matchAll(
      /<div class="sk-site-footer__col"><div class="sk-site-footer__col-title">([^<]*)<\/div><ul[^>]*>([\s\S]*?)<\/ul><\/div>/g,
    ),
  ].map(([, title, list]) => ({
    title,
    items: [
      ...list.matchAll(/<a\b[^>]*\shref="([^"]*)"[^>]*>([^<]*)<\/a>/g),
    ].map(([, href, label]) => [label, href]),
  }));
}

const rollsOf = (urls: string[]): RollUrl[] =>
  urls.map((url) => {
    const page = parseUrl(urlScheme, url);
    if (page?.kind !== 'blog-home' && page?.kind !== 'category')
      throw new Error(`${url} is no roll page`);
    return page;
  });

describe('Footer', () => {
  it('is the design system’s site footer with the tagline and the copyright of its Locale, and no column without a roll', async () => {
    for (const locale of LOCALES) {
      const { tagline, footer } = getPageCopy(locale);
      const html = await renderInRouter(<Footer locale={locale} rolls={[]} />);

      expect(html).toMatch(/<footer class="sk-site-footer"/);
      expect(html).toContain(`>${htmlText(tagline)}<`);
      expect(html).toContain(`>${htmlText(footer.copyright)}<`);
      expect(html).not.toContain('sk-site-footer__col');
    }
  });

  it('renders one column, titled in the page copy, the blog home then each Category under its label', async () => {
    const { listing } = getPageCopy('en');
    const html = await renderInRouter(
      <Footer
        locale="en"
        rolls={rollsOf(['/articles', '/articles/c/privacy', '/articles/c/web'])}
      />,
    );

    expect(footerColumns(html)).toEqual([
      {
        title: htmlText(listing.footer.title),
        items: [
          [htmlText(listing.footer.blogHomeLabel), '/articles'],
          ['privacy', '/articles/c/privacy'],
          ['web', '/articles/c/web'],
        ],
      },
    ]);
  });

  it('ranks the Categories by label in the collation of its Locale, vie privée after typescript in French', async () => {
    const html = await renderInRouter(
      <Footer locale="fr" rolls={await localeRolls({ locale: 'fr' })} />,
    );
    const [column] = footerColumns(html);

    expect(column.items.map(([, href]) => href)).toEqual([
      '/fr/articles',
      '/fr/articles/c/blockchain',
      '/fr/articles/c/javascript',
      '/fr/articles/c/theory',
      '/fr/articles/c/typescript',
      '/fr/articles/c/privacy',
      '/fr/articles/c/web',
    ]);
    expect(column.items.map(([label]) => label).slice(1)).toEqual([
      'blockchain',
      'javascript',
      'théorie',
      'typescript',
      'vie privée',
      'web',
    ]);
  });

  it('links theory from the French footer only, and gives the Spanish one no column', async () => {
    const english = await renderInRouter(
      <Footer locale="en" rolls={await localeRolls({ locale: 'en' })} />,
    );
    const spanish = await renderInRouter(
      <Footer locale="es" rolls={await localeRolls({ locale: 'es' })} />,
    );

    expect(footerColumns(english)).toHaveLength(1);
    expect(hrefs(english).some((href) => href.includes('theory'))).toBe(false);
    expect(english).not.toContain(htmlText(getCategoryLabel('fr', 'theory')));
    expect(spanish).not.toContain('sk-site-footer__col');
  });

  it('shows no version line', async () => {
    const html = await renderInRouter(<Footer locale="en" rolls={[]} />);
    const bottom =
      /class="sk-site-footer__bottom">([\s\S]*?)<\/div><\/footer>/.exec(
        html,
      )?.[1];

    expect(bottom).toBe(
      `<div>${htmlText(getPageCopy('en').footer.copyright)}</div>`,
    );
  });

  it('declares no language of its own, the document’s <html lang> carrying the page’s Locale', async () => {
    const html = await renderInRouter(
      <Footer locale="fr" rolls={await localeRolls({ locale: 'fr' })} />,
      A_FRENCH_ARTICLE,
    );

    expect(html).toMatch(/<footer class="sk-site-footer"/);
    expect(html).not.toMatch(/\slang="/);
  });

  it('throws naming a Locale the site does not declare', () => {
    expect(() => Footer({ locale: 'de', rolls: [] })).toThrow(/"de"/);
  });

  it('throws naming the Category and the Locale when the Locale has no label for a roll’s Category', () => {
    expect(() =>
      Footer({
        locale: 'es',
        rolls: rollsOf(['/es/articles', '/es/articles/c/web']),
      }),
    ).toThrow(/"web"[\s\S]*"es"/);
  });
});
