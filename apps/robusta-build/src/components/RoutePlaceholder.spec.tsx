import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { RoutePlaceholder } from './RoutePlaceholder.js';

describe('RoutePlaceholder', () => {
  it('heads the page with the title it is given, then shows its address', () => {
    const html = renderToStaticMarkup(
      <RoutePlaceholder title="vie privée" url="/fr/articles/c/privacy" />,
    );

    expect(html).toMatch(
      /<h1>vie privée<\/h1><p><code>\/fr\/articles\/c\/privacy<\/code><\/p>/,
    );
  });

  it('lists no fact about the route', () => {
    const html = renderToStaticMarkup(
      <RoutePlaceholder title="articles" url="/en/articles/p/2" />,
    );

    expect(html).not.toMatch(/<dl|<dt|<dd/);
  });
});
