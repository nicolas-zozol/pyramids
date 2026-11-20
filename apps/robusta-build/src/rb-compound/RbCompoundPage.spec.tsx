import { beforeAll, describe, expect, it } from 'vitest';
import { Footer, Header } from '../chrome/index.ts';
import { ctaMascotSrc, heroMascotSrc } from '../design-system/assets.ts';
import { localeRolls } from '../page-data/locale-rolls.ts';
import { pageCounterparts } from '../page-data/page-counterparts.ts';
import { contentUrls } from '../routing/content-urls.ts';
import { LOCALES, urlScheme, type Locale } from '../routing/scheme.ts';
import {
  buildUrl,
  landingPages,
  parseUrl,
  productPages,
} from '../routing/url-scheme/index.ts';
import { getPageCopy, getSeoPyramidsConfig } from '../seopyramids.config.ts';
import { hrefs, htmlText, readableTexts } from '../test-support/markup.ts';
import { renderInRouter } from '../test-support/render-in-router.tsx';
import { RbCompoundPage, rbCompoundHead, rbCompoundUrl } from './index.ts';

const { contact } = getSeoPyramidsConfig();
const MAILTO = `mailto:${contact.email}`;
const BRAND = ['💪', '🏗', 'Robusta Build'];

/** The page of RB Compound as the prerender writes it, the chrome around it. */
async function rbCompoundPage(locale: Locale): Promise<string> {
  const page = { kind: 'product', locale, product: 'rb-compound' } as const;
  const rolls = await localeRolls({ locale });
  return renderInRouter(
    <>
      <Header
        locale={locale}
        counterparts={await pageCounterparts(page)}
        rolls={rolls}
      />
      <RbCompoundPage locale={locale} />
      <Footer locale={locale} rolls={rolls} />
    </>,
    buildUrl(urlScheme, page),
  );
}

function stringsOf(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (typeof value !== 'object' || value === null) return [];
  return Object.values(value).flatMap(stringsOf);
}

const sectionOf = (html: string, marker: string): string =>
  new RegExp(`<section[^>]*${marker}[\\s\\S]*?</section>`).exec(html)?.[0] ??
  '';

let pages: Record<Locale, string>;

beforeAll(async () => {
  pages = Object.fromEntries(
    await Promise.all(
      LOCALES.map(async (locale) => [locale, await rbCompoundPage(locale)]),
    ),
  ) as Record<Locale, string>;
});

describe('the URL of the page of RB Compound', () => {
  it('is /rb-compound under the root of every Locale, and parses back to it', () => {
    expect(LOCALES.map(rbCompoundUrl)).toEqual([
      '/rb-compound',
      '/fr/rb-compound',
      '/es/rb-compound',
    ]);
    for (const locale of LOCALES)
      expect(parseUrl(urlScheme, rbCompoundUrl(locale))).toEqual({
        kind: 'product',
        locale,
        product: 'rb-compound',
      });
  });

  it('is declared indexable, canonical to itself, the two other Locales as versions', () => {
    for (const locale of LOCALES) {
      const head = rbCompoundHead(locale);
      const { title, description } = getPageCopy(locale).rbCompound.head;
      const links = head.links ?? [];

      expect(head.meta).toContainEqual({ title });
      expect(head.meta).toContainEqual({
        name: 'description',
        content: description,
      });
      expect(head.meta).toContainEqual({
        name: 'robots',
        content: 'noindex, nofollow',
      });
      expect(
        links
          .filter((link) => link.rel === 'alternate')
          .map((link) => link.hrefLang),
      ).toEqual(
        expect.arrayContaining(LOCALES.filter((other) => other !== locale)),
      );
    }
  });
});

describe('RbCompoundPage', () => {
  it('is one <main> of Hero, the agents, their open questions, boss, PrinciplesList and CTA, in this order', () => {
    for (const locale of LOCALES) {
      const main = /<main>([\s\S]*)<\/main>/.exec(pages[locale])?.[1] ?? '';
      const order = [
        'class="sk-hero"',
        'id="agents"',
        'id="open-questions"',
        'id="boss"',
        'class="sk-principles-list"',
        'class="sk-cta"',
      ].map((marker) => main.indexOf(marker));

      expect(
        order.every((index) => index >= 0),
        locale,
      ).toBe(true);
      expect(
        [...order].sort((a, b) => a - b),
        locale,
      ).toEqual(order);
    }
  });

  it('carries distinct ids, agents and boss once each', () => {
    for (const page of Object.values(pages)) {
      const ids = [...page.matchAll(/\sid="([^"]*)"/g)].map(([, id]) => id);

      expect(ids.filter((id) => id === 'agents')).toHaveLength(1);
      expect(ids.filter((id) => id === 'boss')).toHaveLength(1);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('carries no form and no field', () => {
    for (const page of Object.values(pages))
      expect(page).not.toMatch(/<form|<input|<textarea|<select/);
  });
});

describe('the two diagrams of the page', () => {
  it('take every text from the page copy of their Locale', () => {
    for (const locale of LOCALES) {
      const { agents, boss } = getPageCopy(locale).rbCompound;

      for (const [id, copy] of [
        ['agents', agents],
        ['boss', boss],
      ] as const) {
        const section = sectionOf(pages[locale], `id="${id}"`);
        const written = [
          copy.eyebrow,
          copy.title,
          ...(copy.intro ? [copy.intro] : []),
          ...(copy.conductor ? [copy.conductor] : []),
          ...copy.steps.flatMap((step) => [
            String(step.n),
            step.label,
            step.sub,
          ]),
          ...(copy.example
            ? [
                copy.example.title,
                ...copy.example.lines.flatMap((line) => [
                  line.agent,
                  line.command,
                  line.note,
                ]),
              ]
            : []),
          copy.caveat,
          ...(copy.caveatLink
            ? [copy.caveatLink.lead, copy.caveatLink.label]
            : []),
        ];

        expect(readableTexts(section), `${locale} ${id}`).toEqual(
          written.map(htmlText),
        );
      }
    }
  });

  it('carry no mascot', () => {
    for (const page of Object.values(pages))
      expect(page).not.toContain('sk-flow-diagram__mascot');
  });

  it('open the link to the code of RB Compound in a new tab', () => {
    for (const page of Object.values(pages))
      expect(page).toContain(
        '<a class="sk-flow-diagram__caveat-link" href="https://github.com/robusta-build/rb-compound" target="_blank" rel="noopener noreferrer">',
      );
  });
});

describe('the words of the page of RB Compound', () => {
  it('reach a reader with no text the site does not supply, header, footer and alt texts included', () => {
    for (const locale of LOCALES) {
      const copy = getPageCopy(locale);
      const supplied = new Set(
        [
          ...stringsOf(copy),
          ...LOCALES.filter((other) => other !== locale).map(
            (other) => getPageCopy(other).localeName,
          ),
          contact.email,
          ...[copy.rbCompound.agents, copy.rbCompound.boss].flatMap((flow) =>
            flow.steps.map((step) => String(step.n)),
          ),
          ...BRAND,
        ].map((text) => htmlText(text.trim())),
      );

      expect(
        readableTexts(pages[locale]).filter((text) => !supplied.has(text)),
        locale,
      ).toEqual([]);
    }
  });

  it('put the hero eyebrow of their Locale in the eyebrow, its title in the one heading, and no "open source"', () => {
    for (const locale of LOCALES) {
      const { hero, head } = getPageCopy(locale).rbCompound;

      expect(pages[locale]).toMatch(
        new RegExp(
          `class="sk-hero__eyebrow"[\\s\\S]*?${htmlText(hero.eyebrow)}`,
        ),
      );
      expect(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(pages[locale])?.[1]).toBe(
        htmlText(hero.title),
      );
      expect(head.description).not.toMatch(/open source/i);
    }
  });
});

describe('the links of the page of RB Compound', () => {
  it('are the email, the LinkedIn profile, the code on GitHub, an anchor of the landing or a path buildUrl produces', async () => {
    const built = new Set(
      [
        ...landingPages(urlScheme),
        ...productPages(urlScheme),
        ...(await contentUrls()),
      ].map((url) => buildUrl(urlScheme, url)),
    );

    for (const locale of LOCALES) {
      const { agents, boss } = getPageCopy(locale).rbCompound;
      const landing = buildUrl(urlScheme, { kind: 'landing', locale });
      const allowed = [
        MAILTO,
        contact.linkedIn,
        ...[agents, boss].flatMap((flow) =>
          flow.caveatLink ? [flow.caveatLink.href] : [],
        ),
        `${landing}#rooftop`,
        `${landing}#masala`,
        ...built,
      ];

      for (const href of hrefs(pages[locale]))
        expect(allowed, locale).toContain(href);
    }
  });

  it('show the two mascots from the design system, the hero’s with the alt text of its Locale', () => {
    for (const locale of LOCALES) {
      const { hero } = getPageCopy(locale).rbCompound;

      expect(pages[locale]).toContain(
        `src="${htmlText(heroMascotSrc)}" alt="${htmlText(hero.mascotAlt)}"`,
      );
      expect(pages[locale]).toContain(`src="${htmlText(ctaMascotSrc)}"`);
    }
  });

  it('lead to the same page in the two other Locales from the header', () => {
    for (const locale of LOCALES) {
      const header = /<header[\s\S]*?<\/header>/.exec(pages[locale])?.[0] ?? '';
      for (const other of LOCALES.filter((o) => o !== locale))
        expect(hrefs(header), locale).toContain(rbCompoundUrl(other));
    }
  });
});
