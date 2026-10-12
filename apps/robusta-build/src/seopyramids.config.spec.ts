import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { getArticleIndex } from './content/article-index.js';
import { urlScheme } from './routing/scheme.js';
import { getSeoPyramidsConfig } from './seopyramids.config.js';

describe('the Site configuration', () => {
  it('declares fr by default and en as the only other Locale', () => {
    const config = getSeoPyramidsConfig();

    expect(config.defaultLocale).toBe('fr');
    expect(config.otherLocales).toEqual(['en']);
  });

  it('reads its Locales from the scheme, at its root as in its blog configuration', () => {
    const config = getSeoPyramidsConfig();

    expect(urlScheme.defaultLocale).toBe('fr');
    expect(config.defaultLocale).toBe(urlScheme.defaultLocale);
    expect(config.otherLocales).toEqual(urlScheme.otherLocales);
    expect(config.blogConfig.defaultLocale).toBe(urlScheme.defaultLocale);
    expect(config.blogConfig.otherLocales).toEqual(urlScheme.otherLocales);
  });
});

describe('the contact of the Site configuration', () => {
  it('holds Nicolas’s email address and his LinkedIn profile as an https URL', () => {
    const { contact } = getSeoPyramidsConfig();

    expect(contact.email).toBe('nicolas@robusta.build');
    expect(contact.linkedIn).toMatch(/^https:\/\/www\.linkedin\.com\/in\//);
  });

  it('is the only place the email address is written in the page copy’s module', async () => {
    const source = await readFile(
      new URL('./seopyramids.config.ts', import.meta.url),
      'utf8',
    );

    expect(source.match(/nicolas@robusta\.build/g)).toHaveLength(1);
  });
});

describe('the page copy of the Site configuration', () => {
  it('is plain text: no markup, no class name, no empty string', () => {
    for (const text of strings(getSeoPyramidsConfig().pageCopy)) {
      expect(text).not.toMatch(/[<>]|className|\bsk-/);
      expect(text.trim()).not.toBe('');
    }
  });

  it('gives the head of / a title and a description of its own', () => {
    const config = getSeoPyramidsConfig();
    const { title, description } = config.pageCopy.landing.head;

    expect(title).not.toBe(config.siteTitle);
    expect(description).not.toBe(config.mission);
  });

  it('labels every Category a published article of the default Locale claims', async () => {
    const { categoryLabels } = getSeoPyramidsConfig().pageCopy;
    const claimed = new Set(
      (await getArticleIndex())
        .filter((article) => article.locale === urlScheme.defaultLocale)
        .flatMap((article) =>
          article.category === undefined ? [] : [article.category],
        ),
    );

    expect(claimed.size).toBeGreaterThan(0);
    for (const category of claimed)
      expect(categoryLabels[category]).toBeTruthy();
  });
});

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (typeof value === 'object' && value !== null)
    return Object.values(value).flatMap(strings);
  return [];
}
