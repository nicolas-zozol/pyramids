import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NotFoundPage } from './NotFoundPage.js';

describe('NotFoundPage', () => {
  it('says the address holds no page, in the site’s own French words', () => {
    const html = renderToStaticMarkup(<NotFoundPage />);

    expect(html).toContain('<h1>page introuvable</h1>');
    expect(html).toContain('<p>Aucune page n’est publiée à cette adresse.</p>');
    expect(html).not.toMatch(/This page could not be found/);
  });

  it('leads back to the home page through a plain anchor, needing no router', () => {
    const html = renderToStaticMarkup(<NotFoundPage />);

    expect(html).toContain('<a href="/">retour à l’accueil</a>');
  });
});
