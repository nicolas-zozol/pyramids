import type { NotePost } from '@robusta/pyramids-design-system';
import { beforeAll, describe, expect, it } from 'vitest';
import { Footer, Header } from '../chrome/index.ts';
import {
  ctaMascotSrc,
  heroMascotSrc,
  rooftopShotSrcs,
} from '../design-system/assets.ts';
import { localeRolls } from '../page-data/locale-rolls.ts';
import { notesFeed } from '../page-data/notes-feed.ts';
import { pageCounterparts } from '../page-data/page-counterparts.ts';
import { rbCompoundUrl } from '../rb-compound/index.ts';
import { contentUrls } from '../routing/content-urls.ts';
import { LOCALES, urlScheme, type Locale } from '../routing/scheme.ts';
import {
  buildUrl,
  landingPages,
  productPages,
} from '../routing/url-scheme/index.ts';
import { getPageCopy, getSeoPyramidsConfig } from '../seopyramids.config.ts';
import {
  anchorsTo,
  hrefs,
  htmlText,
  readableTexts,
} from '../test-support/markup.ts';
import { renderInRouter } from '../test-support/render-in-router.tsx';
import { LandingPage } from './index.ts';
import {
  MASALA_GITHUB,
  MASALA_PACKAGE,
  MASALA_RECIPES,
  MASALA_VIDEO,
  MASALA_WORDS,
} from './masala-recipes.ts';

const { contact } = getSeoPyramidsConfig();
const MAILTO = `mailto:${contact.email}`;
const WITH_NOTES: Locale[] = ['en', 'fr'];
const BRAND = ['💪', '🏗', 'Robusta Build'];

const landingOf = (locale: Locale) =>
  buildUrl(urlScheme, { kind: 'landing', locale });
const rooftopOf = (locale: Locale) => `${landingOf(locale)}#rooftop`;
const masalaOf = (locale: Locale) => `${landingOf(locale)}#masala`;
const waitingListOf = (locale: Locale) =>
  `${MAILTO}?subject=${encodeURIComponent(getPageCopy(locale).landing.products.rooftop.waitingListSubject)}`;

/** A landing page as the prerender writes it: the chrome around it, on the real feed of its Locale. */
async function landingPage(
  locale: Locale,
  posts?: NotePost[],
): Promise<string> {
  const page = { kind: 'landing', locale } as const;
  const rolls = await localeRolls({ locale });
  return renderInRouter(
    <>
      <Header
        locale={locale}
        counterparts={await pageCounterparts(page)}
        rolls={rolls}
      />
      <LandingPage
        locale={locale}
        posts={posts ?? (await notesFeed({ locale, limit: 4 }))}
      />
      <Footer locale={locale} rolls={rolls} />
    </>,
    buildUrl(urlScheme, page),
  );
}

/** Every text the site supplies to the landing page of `locale`, as React DOM escapes it: its page copy, the code of Masala Parser and the paths it writes. */
async function suppliedTexts(locale: Locale): Promise<Set<string>> {
  const copy = getPageCopy(locale);
  const otherLocaleNames = LOCALES.filter((other) => other !== locale).map(
    (other) => getPageCopy(other).localeName,
  );
  const feed = await notesFeed({ locale, limit: 4 });
  const stepNumbers = copy.rbCompound.agents.steps.map((step) =>
    String(step.n),
  );

  return new Set(
    [
      ...stringsOf(copy),
      ...otherLocaleNames,
      contact.email,
      ...feed.flatMap((post) => [post.title, post.date]),
      ...stringsOf(feed.map((post) => [post.dateParts, post.summary])),
      ...stepNumbers,
      ...stringsOf(MASALA_RECIPES),
      ...MASALA_WORDS.map((word) => word.term),
      'npm',
      `install ${MASALA_PACKAGE}`,
      `${MASALA_GITHUB.replace('https://', '')} →`,
      `robusta.build${rbCompoundUrl(locale)} →`,
      ...BRAND,
    ].map((text) => htmlText(text.trim())),
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
  it('is one <main> of HomeHero, ProductDoors, Masala Parser, the notes section and Workshop, in this order', () => {
    for (const locale of WITH_NOTES) {
      const main = /<main>([\s\S]*)<\/main>/.exec(pages[locale])?.[1] ?? '';
      const order = [
        'class="sk-home-hero"',
        'class="sk-product-doors"',
        'id="masala"',
        'class="sk-notes-preview"',
        'class="sk-workshop',
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
    expect(pages.es.indexOf('id="masala"')).toBeLessThan(
      pages.es.indexOf('class="sk-workshop'),
    );
  });

  it('keeps nothing of the shell’s demonstration, its only callout the greeting of the workshop', () => {
    for (const page of Object.values(pages)) {
      expect(page).not.toMatch(/placeholder|--font-script/);
      expect(page.match(/class="sk-callout[ "]/g)).toHaveLength(1);
      expect(page).toContain('class="sk-callout sk-workshop__greeting"');
    }
  });

  it('shows the notes it receives, fewer than four as they are, and no section on none', async () => {
    const feed = await notesFeed({ locale: 'en', limit: 4 });
    const three = await landingPage('en', feed.slice(0, 3));
    const none = await landingPage('en', []);

    expect(three.match(/class="sk-box sk-notes-preview__post"/g)).toHaveLength(
      3,
    );
    expect(none).not.toContain('sk-notes-preview');
  });

  it('carries no form and no field', () => {
    for (const page of Object.values(pages))
      expect(page).not.toMatch(/<form|<input|<textarea|<select/);
  });

  it('carries distinct ids, rooftop on the door of Rooftop and masala on the section of Masala Parser', () => {
    for (const page of Object.values(pages)) {
      const ids = [...page.matchAll(/\sid="([^"]*)"/g)].map(([, id]) => id);

      expect(new Set(ids).size).toBe(ids.length);
      expect(page).toMatch(
        /<article id="rooftop" class="[^"]*sk-product-doors__door"/,
      );
      expect(page).toContain(
        '<section id="masala" class="sk-library-showcase"',
      );
    }
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

  it('put the hero title of their Locale in the one heading, its eyebrow under it', () => {
    for (const locale of LOCALES) {
      const { hero } = getPageCopy(locale).landing;

      expect(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(pages[locale])?.[1]).toBe(
        htmlText(hero.title),
      );
      expect(pages[locale]).toContain(
        `<p class="sk-home-hero__eyebrow">${htmlText(hero.eyebrow)}</p>`,
      );
    }
  });

  it('set the names of the two products in bold in the hero', () => {
    for (const page of Object.values(pages)) {
      expect(page).toContain(
        '<strong class="sk-home-hero__strong">RB Compound</strong>',
      );
      expect(page).toContain(
        '<strong class="sk-home-hero__strong">Rooftop</strong>',
      );
    }
  });

  it('carry no copy for the SMEs of Toulouse (R-MULTILINGUAL-44)', () => {
    for (const page of Object.values(pages)) {
      expect(readableTexts(page).join(' ')).not.toMatch(
        /PME|Haute-Garonne|sur place|Renault|BCG/,
      );
    }
  });

  it('name neither EVM, Toptal, Oracle, remote, a price but the day rate of the workshop, a revenue threshold nor a dated availability (AC-LANDING-3)', () => {
    for (const locale of LOCALES) {
      const [dayRate] = getPageCopy(locale).landing.workshop.facts;
      const pitch = pages[locale]
        .replace(/class="sk-notes-preview"[\s\S]*?<\/section>/, '')
        .replace(/class="sk-library-showcase"[\s\S]*?<\/section>/, '')
        .replace(htmlText(dayRate.strong), '');
      const text = readableTexts(pitch).join(' ');

      expect(text, locale).not.toMatch(
        /EVM|Toptal|Oracle|remote|chiffre d|[€$£]|\bq[1-4]\b|slots?|créneau|20[0-9]{2}/i,
      );
      expect(dayRate.strong, locale).toMatch(/2[ ,.]000 ?€|€2,000/);
    }
  });
});

describe('the calls to contact of the landing page', () => {
  it('are, in the hero, the email address then the LinkedIn profile, labelled in its Locale, then its floors to Rooftop and RB Compound', () => {
    for (const locale of LOCALES) {
      const { hero } = getPageCopy(locale).landing;
      const heroSection = sectionOf(pages[locale], 'class="sk-home-hero"');

      expect(hrefs(heroSection)).toEqual([
        MAILTO,
        contact.linkedIn,
        rooftopOf(locale),
        rbCompoundUrl(locale),
      ]);
      expect(heroSection).toContain(`>${htmlText(hero.emailLabel)}<`);
      expect(heroSection).toContain(`>${htmlText(hero.linkedInLabel)}<`);
    }
  });

  it('are, on the doors, the waiting list of Rooftop by email, then the page of RB Compound twice', () => {
    for (const locale of LOCALES) {
      const doors = sectionOf(pages[locale], 'class="sk-product-doors"');

      expect(hrefs(doors)).toEqual([
        htmlText(waitingListOf(locale)),
        rbCompoundUrl(locale),
        rbCompoundUrl(locale),
      ]);
    }
  });

  it('is, in the workshop, the address itself leading to an email, then the LinkedIn profile', () => {
    for (const locale of LOCALES) {
      const { workshop } = getPageCopy(locale).landing;
      const closing = sectionOf(pages[locale], 'class="sk-workshop');

      expect(hrefs(closing)).toEqual([MAILTO, contact.linkedIn]);
      expect(closing).toContain(`>${htmlText(contact.email)}<`);
      expect(closing).toContain(`>${htmlText(workshop.title)}<`);
    }
  });

  it('show the mascots and the screenshots of Rooftop from the design system, each with the alt text of its Locale', () => {
    for (const locale of LOCALES) {
      const { hero, products, workshop } = getPageCopy(locale).landing;
      const shown = [
        [heroMascotSrc, hero.mascotAlt],
        [ctaMascotSrc, workshop.mascotAlt],
        ...rooftopShotSrcs.map((src, i) => [src, products.rooftop.shotAlts[i]]),
      ];

      for (const [src, alt] of shown)
        expect(pages[locale]).toContain(
          `src="${htmlText(src)}" alt="${htmlText(alt)}"`,
        );
    }
  });
});

describe('every link of the three landing pages', () => {
  it('leads to the contact email, the LinkedIn profile, Masala Parser’s repository and video, an anchor of the landing or a path buildUrl produces, header and footer included', async () => {
    const built = new Set(
      [
        ...landingPages(urlScheme),
        ...productPages(urlScheme),
        ...(await contentUrls()),
      ].map((url) => buildUrl(urlScheme, url)),
    );

    for (const locale of LOCALES) {
      const allowed = [
        MAILTO,
        htmlText(waitingListOf(locale)),
        contact.linkedIn,
        MASALA_GITHUB,
        MASALA_VIDEO,
        rooftopOf(locale),
        masalaOf(locale),
        ...built,
      ];

      expect(hrefs(pages[locale]).length, locale).toBeGreaterThan(0);
      for (const href of hrefs(pages[locale]))
        expect(allowed, locale).toContain(href);
    }
  });

  it('names in the header Rooftop and RB Compound in bold, then Masala Parser, then the articles of its Locale when it has some', () => {
    for (const locale of LOCALES) {
      const header = /<header[\s\S]*?<\/header>/.exec(pages[locale])?.[0] ?? '';
      const sections = [
        ...header.matchAll(
          /<a\b[^>]*class="(sk-site-header__section[^"]*)"[^>]*>/g,
        ),
      ].map(([tag, className]) => [
        /\shref="([^"]*)"/.exec(tag)?.[1],
        className,
      ]);

      expect(sections, locale).toEqual([
        [
          rooftopOf(locale),
          'sk-site-header__section sk-site-header__section--product',
        ],
        [
          rbCompoundUrl(locale),
          'sk-site-header__section sk-site-header__section--product',
        ],
        [masalaOf(locale), 'sk-site-header__section'],
        ...(WITH_NOTES.includes(locale)
          ? [
              [
                buildUrl(urlScheme, { kind: 'blog-home', locale, page: 1 }),
                'sk-site-header__section',
              ],
            ]
          : []),
      ]);
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
