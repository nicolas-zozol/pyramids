import { urlScheme } from '../routing/scheme.js';
import { buildUrl } from '../routing/url-scheme/index.js';

const DEFAULT_LANDING = buildUrl(urlScheme, {
  kind: 'landing',
  locale: urlScheme.defaultLocale,
});

/** The site's not-found page, in English whatever the address, rendered on a document that loads no script. */
export function NotFoundPage() {
  return (
    <main lang="en" style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
      <h1>page not found</h1>
      <p>No page is published at this address.</p>
      <p>
        <a href={DEFAULT_LANDING}>back to the home page</a>
      </p>
    </main>
  );
}
