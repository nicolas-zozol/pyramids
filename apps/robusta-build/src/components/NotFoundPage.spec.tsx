import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NotFoundPage } from './NotFoundPage.js';

describe('NotFoundPage', () => {
  it('says the address holds no page, in the site’s own words', () => {
    const html = renderToStaticMarkup(<NotFoundPage />);

    expect(html).toMatch(/<h1>[^<]+<\/h1>/);
    expect(html).not.toMatch(/This page could not be found/);
  });

  it('leads back to the home page through a plain anchor, needing no router', () => {
    const html = renderToStaticMarkup(<NotFoundPage />);

    expect(html).toMatch(/<a href="\/">[^<]+<\/a>/);
  });
});
