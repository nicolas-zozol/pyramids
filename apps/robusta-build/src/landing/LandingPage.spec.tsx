import {
  BrandLogo,
  CTA,
  Hero,
  NotesPreview,
  PrinciplesList,
  SiteFooter,
  SiteHeader,
  type NotePost,
} from '@robusta/pyramids-design-system';
import { buildUrl } from '../routing/url-scheme/index.js';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it } from 'vitest';
import { Footer, Header } from '../chrome/index.js';
import { ctaMascotSrc, heroMascotSrc } from '../design-system/assets.js';
import { notesFeed } from '../page-data/notes-feed.js';
import { contentUrls } from '../routing/content-urls.js';
import { urlScheme } from '../routing/scheme.js';
import { getSeoPyramidsConfig } from '../seopyramids.config.js';
import {
  anchorsTo,
  hrefs,
  htmlText,
  readableTexts,
} from '../test-support/markup.js';
import { renderInRouter } from '../test-support/render-in-router.js';
import { LandingPage } from './index.js';

const { contact, pageCopy } = getSeoPyramidsConfig();
const { hero, cta } = pageCopy.landing;
const MAILTO = `mailto:${contact.email}`;

/** `/` as the prerender writes it: the chrome around the landing page, on the real feed. */
async function homePage(posts: NotePost[]): Promise<string> {
  return renderInRouter(
    <>
      <Header />
      <LandingPage posts={posts} />
      <Footer />
    </>,
  );
}

let feed: NotePost[];
let page: string;

beforeAll(async () => {
  feed = await notesFeed({ locale: urlScheme.defaultLocale, limit: 4 });
  page = await homePage(feed);
});

describe('LandingPage', () => {
  it('is one <main> of Hero, PrinciplesList, the notes section and CTA, in this order', () => {
    const main = /<main>([\s\S]*)<\/main>/.exec(page)?.[1] ?? '';
    const order = [
      'sk-hero',
      'sk-principles-list',
      'sk-notes-preview',
      'sk-cta',
    ].map((surface) => main.indexOf(`class="${surface}"`));

    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('keeps nothing of the shell’s demonstration', () => {
    expect(page).not.toMatch(/placeholder|sk-callout|--font-script/);
  });

  it('shows the notes it receives, fewer than four as they are, and no section on none', async () => {
    const three = await homePage(feed.slice(0, 3));
    const none = await homePage([]);

    expect(three.match(/class="sk-notes-preview__post"/g)).toHaveLength(3);
    expect(none).not.toContain('sk-notes-preview');
  });

  it('carries no form and no field', () => {
    expect(page).not.toMatch(/<form|<input|<textarea|<select/);
  });
});

describe('the words of the landing page', () => {
  it('reach a reader with none of the design system’s prototype copy, alt texts included (AC-LANDING-2)', () => {
    const brand = new Set(
      readableTexts(renderToStaticMarkup(<BrandLogo size="compact" />)),
    );
    const prototype = [
      <SiteHeader key="header" />,
      <Hero key="hero" mascotSrc="x.svg" />,
      <PrinciplesList key="principles" />,
      <NotesPreview key="notes" />,
      <CTA key="cta" />,
      <SiteFooter key="footer" />,
    ]
      .flatMap((surface) => readableTexts(renderToStaticMarkup(surface)))
      .filter((text) => !brand.has(text));
    const read = new Set(readableTexts(page));

    expect(prototype.length).toBeGreaterThan(20);
    expect(prototype.filter((text) => read.has(text))).toEqual([]);
    expect(page).not.toMatch(
      /we build software|small team|this is crystal tux|what we publish|reading is itself/i,
    );
  });

  it('put the tagline in the eyebrow and twenty years in the title (AC-LANDING-3)', () => {
    expect(page).toMatch(
      new RegExp(
        `class="sk-hero__eyebrow"[\\s\\S]*?${htmlText(pageCopy.tagline)}`,
      ),
    );
    expect(/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(page)?.[1]).toMatch(/vingt ans/);
  });

  it('name Renault, the BCG, the startups, Toulouse, the area served and meetings in person (AC-LANDING-3)', () => {
    const text = readableTexts(page).join(' ');

    for (const word of [
      'Renault',
      'BCG',
      'startups',
      'Toulouse',
      'Haute-Garonne',
      'sur place',
    ])
      expect(text).toContain(word);
  });

  it('name neither EVM, Toptal, Oracle, remote, a revenue threshold nor a dated availability (AC-LANDING-3)', () => {
    const pitch = page.replace(
      /class="sk-notes-preview"[\s\S]*?<\/section>/,
      '',
    );
    const text = readableTexts(pitch).join(' ');

    expect(text).not.toMatch(
      /EVM|Toptal|Oracle|remote|chiffre d|€|\bq[1-4]\b|slots?|créneau|20[0-9]{2}/i,
    );
  });
});

describe('the calls to contact of the landing page', () => {
  it('are, in the hero, the email address then the LinkedIn profile', () => {
    const heroSection =
      /class="sk-hero"[\s\S]*?<\/section>/.exec(page)?.[0] ?? '';

    expect(hrefs(heroSection)).toEqual([MAILTO, contact.linkedIn]);
    expect(heroSection).toContain(`>${htmlText(hero.emailLabel)}<`);
    expect(heroSection).toContain(`>${htmlText(hero.linkedInLabel)}<`);
  });

  it('is, in the closing block, the address itself leading to an email', () => {
    const closing = /class="sk-cta"[\s\S]*?<\/section>/.exec(page)?.[0] ?? '';

    expect(hrefs(closing)).toEqual([MAILTO]);
    expect(closing).toContain(`>${htmlText(contact.email)}<`);
    expect(closing).toContain(`>${htmlText(cta.title)}<`);
  });

  it('show the two mascots from the design system, the hero’s with its French alt text', () => {
    expect(page).toContain(
      `src="${htmlText(heroMascotSrc)}" alt="${htmlText(hero.mascotAlt)}"`,
    );
    expect(page).toContain(`src="${htmlText(ctaMascotSrc)}"`);
  });
});

describe('every link of /', () => {
  it('leads to a page the site publishes, an email to Nicolas or his LinkedIn profile', async () => {
    const published = new Set([
      '/',
      ...(await contentUrls()).map((url) => buildUrl(urlScheme, url)),
    ]);

    for (const href of hrefs(page))
      expect([MAILTO, contact.linkedIn, ...published]).toContain(href);
  });

  it('includes "all articles" pointing at /articles and the notes at their pages', () => {
    expect(anchorsTo(page, '/articles')).toHaveLength(1);
    for (const post of feed)
      expect(anchorsTo(page, post.href ?? '')).toHaveLength(1);
  });
});
