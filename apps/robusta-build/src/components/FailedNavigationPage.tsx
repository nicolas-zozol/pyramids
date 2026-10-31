import { urlScheme } from '../routing/scheme.ts';
import { buildUrl } from '../routing/url-scheme/index.ts';

const DEFAULT_LANDING = buildUrl(urlScheme, {
  kind: 'landing',
  locale: urlScheme.defaultLocale,
});

interface FailedNavigationPageProps {
  /** The address whose navigation failed. */
  href: string;
}

/** The error state of a navigation that failed twice, in constant English like the 404: retry the address, or go back home. */
export function FailedNavigationPage({ href }: FailedNavigationPageProps) {
  return (
    <main lang="en" style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
      <h1>this page could not load</h1>
      <p>
        <a href={href}>retry this address</a> or{' '}
        <a href={DEFAULT_LANDING}>back to the home page</a>.
      </p>
    </main>
  );
}
