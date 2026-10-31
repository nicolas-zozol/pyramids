import { readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { Footer, Header } from '../chrome/index.js';
import { notesFeed } from '../page-data/notes-feed.js';
import { pageCounterparts } from '../page-data/page-counterparts.js';
import { LOCALES } from '../routing/scheme.js';
import { getSeoPyramidsConfig } from '../seopyramids.config.js';
import { classNames, hrefs } from '../test-support/markup.js';
import { renderInRouter } from '../test-support/render-in-router.js';
import { LandingPage } from './index.js';

const SOURCES = ['src/landing', 'src/chrome'];
const STYLESHEETS = [
  '@robusta/pyramids-design-system/sketch.css',
  '@robusta/pyramids-design-system/colors_and_type.css',
];

let page: string;

beforeAll(async () => {
  const pages = await Promise.all(
    LOCALES.map(async (locale) =>
      renderInRouter(
        <>
          <Header
            locale={locale}
            counterparts={await pageCounterparts({ kind: 'landing', locale })}
          />
          <LandingPage
            locale={locale}
            posts={await notesFeed({ locale, limit: 4 })}
          />
          <Footer locale={locale} />
        </>,
      ),
    ),
  );
  page = pages.join('\n');
});

describe('the layout of the landing page and the chrome', () => {
  it('uses class names of the design system and no other', async () => {
    const require = createRequire(import.meta.url);
    const css = (
      await Promise.all(
        STYLESHEETS.map((sheet) => readFile(require.resolve(sheet), 'utf8')),
      )
    ).join('\n');
    const designSystemClasses = new Set(
      [...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map(([, name]) => name),
    );

    expect(
      classNames(page).filter((name) => !designSystemClasses.has(name)),
    ).toEqual([]);
  });

  it('is set by no class, inline style, @media or responsive variant of the site’s own', async () => {
    for (const [path, source] of await sourcesOf(SOURCES)) {
      expect(source, path).not.toMatch(
        /className|style=|@media|\b(sm|md|lg|xl|2xl|mob):/,
      );
    }
  });
});

describe('the site', () => {
  it('leads to no resume, from its page copy or from the three rendered landing pages', () => {
    const copy = JSON.stringify(getSeoPyramidsConfig());

    for (const text of [copy, page]) {
      expect(text).not.toMatch(
        /<iframe|toptal\.com\/resume|\bcv\b|curriculum|résumé|resume/i,
      );
    }
    expect(hrefs(page).filter((href) => /\.pdf\b/i.test(href))).toEqual([]);
  });

  it('leads to no resume from its corpus, the link to Toptal’s home page staying', async () => {
    const articles = await sourcesOf(['content/articles']);

    expect(articles.length).toBeGreaterThan(0);
    for (const [path, body] of articles) {
      expect(body, path).not.toMatch(
        /<iframe|toptal\.com\/resume|\]\([^)]*\.pdf\b|href="[^"]*\.pdf\b/i,
      );
    }
  });
});

async function sourcesOf(directories: string[]): Promise<[string, string][]> {
  const files = await Promise.all(
    directories.map(async (directory) =>
      (await readdir(directory, { recursive: true }))
        .filter(
          (file) => /\.(tsx?|md)$/.test(file) && !/\.spec\.tsx?$/.test(file),
        )
        .map((file) => join(directory, file)),
    ),
  );
  return Promise.all(
    files
      .flat()
      .map(
        async (path) =>
          [path, await readFile(path, 'utf8')] as [string, string],
      ),
  );
}
