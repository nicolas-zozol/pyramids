import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { FailedNavigationPage } from './FailedNavigationPage.js';

describe('FailedNavigationPage', () => {
  it('says the page could not load, in French', () => {
    const html = renderToStaticMarkup(
      <FailedNavigationPage href="/l/en/articles/c/web" />,
    );

    expect(html).toContain('<h1>cette page n’a pas pu se charger</h1>');
  });

  it('offers to retry the address that failed, or to go back home', () => {
    const html = renderToStaticMarkup(
      <FailedNavigationPage href="/l/en/articles/c/web" />,
    );

    expect(html).toContain(
      '<a href="/l/en/articles/c/web">réessayer cette adresse</a>',
    );
    expect(html).toContain('<a href="/">revenir à l’accueil</a>');
  });
});
