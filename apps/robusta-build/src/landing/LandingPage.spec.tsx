import type { NotePost } from '@robusta/pyramids-design-system';
import { beforeAll, describe, expect, it } from 'vitest';
import { Footer, Header } from '../chrome/index.ts';
import { ctaMascotSrc, heroMascotSrc } from '../design-system/assets.ts';
import { localeRolls } from '../page-data/locale-rolls.ts';
import { notesFeed } from '../page-data/notes-feed.ts';
import { pageCounterparts } from '../page-data/page-counterparts.ts';
import { contentUrls } from '../routing/content-urls.ts';
import { LOCALES, urlScheme, type Locale } from '../routing/scheme.ts';
import { buildUrl, landingPages } from '../routing/url-scheme/index.ts';
import { getPageCopy, getSeoPyramidsConfig } from '../seopyramids.config.ts';
import {
  anchorsTo,
  hrefs,
  htmlText,
  readableTexts,
} from '../test-support/markup.ts';
import { renderInRouter } from '../test-support/render-in-router.tsx';
import { LandingPage } from './index.ts';

const { contact } = getSeoPyramidsConfig();
const MAILTO = `mailto:${contact.email}`;
const WITH_NOTES: Locale[] = ['en', 'fr'];
const BRAND = ['💪', '🏗', 'Robusta Build'];

/** A landing page as the prerender writes it: the chrome around it, on the real feed of its Locale. */
async function landingPage(
  locale: Locale,
  posts?: NotePost[],
): Promise<string> {
  const page = { kind: 'landing', locale } as const;
  return renderInRouter(
    <>
      <Header locale={locale} counterparts={await pageCounterparts(page)} />
      <LandingPage
        locale={locale}
        posts={posts ?? (await notesFeed({ locale, limit: 4 }))}
      />
      <Footer locale={locale} rolls={await localeRolls({ locale })} />
    </>,
    buildUrl(urlScheme, page),
  );
}

/** Every text the site supplies to the landing page of `locale`, as React DOM escapes it. */
async function suppliedTexts(locale: Locale): Promise<Set<string>> {
  const copy = getPageCopy(locale);
  const { openSource, complete } = copy.landing;
  const otherLocaleNames = LOCALES.filter((other) => other !== locale).map(
    (other) => getPageCopy(other).localeName,
  );
  const feed = await notesFeed({ locale, limit: 4 });
  const stepNumbers = [openSource, complete].flatMap((flow) =>
    flow.steps.map((step) => String(step.n)),
  );

  return new Set(
    [
      ...stringsOf(copy),
      ...otherLocaleNames,
      contact.email,
      ...feed.flatMap((post) => [post.title, post.date]),
      ...stepNumbers,
      ...BRAND,
    ].map(htmlText),
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
      LOCALES.map(async (locale) => [locale, await landingPage(locale)]),
    ),
  ) as Record<Locale, string>;
});

describe('LandingPage', () => {
  it('is one <main> of Hero, the two diagrams, PrinciplesList, the notes section and CTA, in this order', () => {
    for (const locale of WITH_NOTES) {
      const main = /<main>([\s\S]*)<\/main>/.exec(pages[locale])?.[1] ?? '';
      const order = [
        'class="sk-hero"',
        'id="open-source"',
        'id="complete"',
        'class="sk-principles-list"',
        'class="sk-notes-preview"',
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

  it('renders no notes section on the Spanish landing page, no Spanish article being published', () => {
    expect(pages.es).not.toContain('sk-notes-preview');
    expect(pages.es.indexOf('id="complete"')).toBeLessThan(
      pages.es.indexOf('class="sk-principles-list"'),
    );
  });

  it('keeps nothing of the shell’s demonstration, its only callouts the bubbles of the diagrams', () => {
    for (const page of Object.values(pages)) {
      expect(page).not.toMatch(/placeholder|--font-script/);
      expect(page.match(/class="sk-callout[ "]/g)).toHaveLength(2);
      expect(
        page.match(/class="sk-callout sk-flow-diagram__bubble"/g),
      ).toHaveLength(2);
    }
  });

  it('shows the notes it receives, fewer than four as they are, and no section on none', async () => {
    const feed = await notesFeed({ locale: 'en', limit: 4 });
    const three = await landingPage('en', feed.slice(0, 3));
    const none = await landingPage('en', []);

    expect(three.match(/class="sk-notes-preview__post"/g)).toHaveLength(3);
    expect(none).not.toContain('sk-notes-preview');
  });

  it('carries no form and no field', () => {
    for (const page of Object.values(pages))
      expect(page).not.toMatch(/<form|<input|<textarea|<select/);
  });
});

describe('the two diagrams of a landing page', () => {
  it('carry the ids open-source and complete, distinct, the same in every Locale, and no approach', () => {
    for (const page of Object.values(pages)) {
      const ids = [...page.matchAll(/\sid="([^"]*)"/g)].map(([, id]) => id);

      expect(ids.filter((id) => id === 'open-source')).toHaveLength(1);
      expect(ids.filter((id) => id === 'complete')).toHaveLength(1);
      expect(new Set(ids).size).toBe(ids.length);
      expect(page).not.toContain('id="approach"');
    }
  });

  it('take every text from the page copy of their Locale', () => {
    for (const locale of LOCALES) {
      const { openSource, complete } = getPageCopy(locale).landing;

      for (const [id, copy] of [
        ['open-source', openSource],
        ['complete', complete],
      ] as const) {
        const section = sectionOf(pages[locale], `id="${id}"`);
        const texts = readableTexts(section);
        const written = [
          copy.eyebrow,
          copy.title,
          ...copy.steps.flatMap((step) => [
            String(step.n),
            step.label,
            step.sub,
          ]),
          copy.caveat,
        ];

        expect(texts, `${locale} ${id}`).toEqual(written.map(htmlText));
      }
    }
  });

  it('carry no mascot', () => {
    for (const page of Object.values(pages))
      expect(page).not.toContain('sk-flow-diagram__mascot');
  });
});

describe('the words of the landing page', () => {
  it('reach a reader with no text the site does not supply, header, footer and alt texts included (AC-LANDING-2)', async () => {
    for (const locale of LOCALES) {
      const supplied = await suppliedTexts(locale);
      const page = pages[locale];

      expect(
        readableTexts(page).filter((text) => !supplied.has(text)),
        locale,
      ).toEqual([]);
      expect(page).not.toMatch(
        /we build software|small team|what we publish|reading is itself|five steps|engagement runs/i,
      );
    }
  });

  it('put the tagline of their Locale in the eyebrow and its hero title in the one heading', () => {
    for (const locale of LOCALES) {
      const { tagline, landing } = getPageCopy(locale);

      expect(pages[locale]).toMatch(
        new RegExp(`class="sk-hero__eyebrow"[\\s\\S]*?${htmlText(tagline)}`),
      );
      expect(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(pages[locale])?.[1]).toBe(
        htmlText(landing.hero.title),
      );
    }
  });

  it('carry no hero footnote and no copy for the SMEs of Toulouse (R-MULTILINGUAL-44)', () => {
    for (const page of Object.values(pages)) {
      expect(page).not.toContain('sk-hero__footnote');
      expect(readableTexts(page).join(' ')).not.toMatch(
        /PME|Haute-Garonne|sur place|Renault|BCG/,
      );
    }
  });

  it('name neither EVM, Toptal, Oracle, remote, a price, a revenue threshold nor a dated availability (AC-LANDING-3)', () => {
    for (const page of Object.values(pages)) {
      const pitch = page.replace(
        /class="sk-notes-preview"[\s\S]*?<\/section>/,
        '',
      );
      const text = readableTexts(pitch).join(' ');

      expect(text).not.toMatch(
        /EVM|Toptal|Oracle|remote|chiffre d|[€$£]|\bq[1-4]\b|slots?|créneau|20[0-9]{2}/i,
      );
    }
  });
});

describe('the calls to contact of the landing page', () => {
  it('are, in the hero, the email address then the LinkedIn profile, labelled in its Locale', () => {
    for (const locale of LOCALES) {
      const { hero } = getPageCopy(locale).landing;
      const heroSection = sectionOf(pages[locale], 'class="sk-hero"');

      expect(hrefs(heroSection)).toEqual([MAILTO, contact.linkedIn]);
      expect(heroSection).toContain(`>${htmlText(hero.emailLabel)}<`);
      expect(heroSection).toContain(`>${htmlText(hero.linkedInLabel)}<`);
    }
  });

  it('is, in the closing block, the address itself leading to an email', () => {
    for (const locale of LOCALES) {
      const { cta } = getPageCopy(locale).landing;
      const closing = sectionOf(pages[locale], 'class="sk-cta"');

      expect(hrefs(closing)).toEqual([MAILTO]);
      expect(closing).toContain(`>${htmlText(contact.email)}<`);
      expect(closing).toContain(`>${htmlText(cta.title)}<`);
    }
  });

  it('show the two mascots from the design system, the hero’s with the alt text of its Locale', () => {
    for (const locale of LOCALES) {
      const { hero } = getPageCopy(locale).landing;

      expect(pages[locale]).toContain(
        `src="${htmlText(heroMascotSrc)}" alt="${htmlText(hero.mascotAlt)}"`,
      );
      expect(pages[locale]).toContain(`src="${htmlText(ctaMascotSrc)}"`);
    }
  });
});

describe('every link of the three landing pages', () => {
  it('leads to the contact email, the LinkedIn profile or a path buildUrl produces, header and footer included', async () => {
    const built = new Set(
      [...landingPages(urlScheme), ...(await contentUrls())].map((url) =>
        buildUrl(urlScheme, url),
      ),
    );

    for (const [locale, page] of Object.entries(pages)) {
      expect(hrefs(page).length, locale).toBeGreaterThan(0);
      for (const href of hrefs(page))
        expect([MAILTO, contact.linkedIn, ...built], locale).toContain(href);
    }
  });

  it('includes "all articles" pointing at the blog home of its Locale and the notes at their pages', async () => {
    for (const locale of WITH_NOTES) {
      const feed = await notesFeed({ locale, limit: 4 });
      const others = WITH_NOTES.filter((other) => other !== locale);

      const blogHome = (of: string) =>
        buildUrl(urlScheme, { kind: 'blog-home', locale: of, page: 1 });

      const notes = sectionOf(pages[locale], 'class="sk-notes-preview"');

      expect(anchorsTo(notes, blogHome(locale))).toHaveLength(1);
      for (const other of others)
        expect(anchorsTo(pages[locale], blogHome(other))).toHaveLength(0);
      for (const post of feed)
        expect(anchorsTo(pages[locale], post.href ?? '')).toHaveLength(1);
    }
  });
});
