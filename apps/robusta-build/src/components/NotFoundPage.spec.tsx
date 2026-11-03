import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { urlScheme } from '../routing/scheme.ts';
import { buildUrl } from '../routing/url-scheme/index.ts';
import { NotFoundPage } from './NotFoundPage.tsx';

describe('NotFoundPage', () => {
  it('says the address holds no page, in constant English words', () => {
    const html = renderToStaticMarkup(<NotFoundPage />);

    expect(html).toContain('<h1>page not found</h1>');
    expect(html).toContain('<p>No page is published at this address.</p>');
    expect(html).not.toMatch(/This page could not be found|introuvable/);
  });

  it('declares its own language, English, wherever it renders', () => {
    const html = renderToStaticMarkup(<NotFoundPage />);

    expect(html).toMatch(/^<main lang="en"/);
  });

  it('leads back to the landing page of the default Locale through a plain anchor, needing no router', () => {
    const html = renderToStaticMarkup(<NotFoundPage />);
    const landing = buildUrl(urlScheme, {
      kind: 'landing',
      locale: urlScheme.defaultLocale,
    });

    expect(landing).toBe('/');
    expect(html).toContain(`<a href="${landing}">back to the home page</a>`);
  });
});
