import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FailedNavigationPage } from './FailedNavigationPage.js';

describe('FailedNavigationPage', () => {
  it('says the page could not load, in English whatever the Locale of the page', () => {
    const html = renderToStaticMarkup(
      <FailedNavigationPage href="/fr/articles/c/web" />,
    );

    expect(html).toContain('<main lang="en"');
    expect(html).toContain('<h1>this page could not load</h1>');
  });

  it('offers to retry the address that failed, or to go back to the default landing page', () => {
    const html = renderToStaticMarkup(
      <FailedNavigationPage href="/fr/articles/c/web" />,
    );

    expect(html).toContain(
      '<a href="/fr/articles/c/web">retry this address</a>',
    );
    expect(html).toContain('<a href="/en">back to the home page</a>');
  });
});
