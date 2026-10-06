import { BrandLogo, SkCallout } from '@robusta/pyramids-design-system';
import { createFileRoute } from '@tanstack/react-router';
import { wordmarkSrc } from '@/design-system/assets.js';
import { NotesSection } from '@/landing/NotesSection.js';
import { getNotesFeed } from '@/page-data/index.js';
import { urlScheme } from '@/routing/scheme.js';

export const Route = createFileRoute('/')({
  loader: () =>
    getNotesFeed({ data: { locale: urlScheme.defaultLocale, limit: 4 } }),
  component: Home,
});

// TODO: robusta-landing-page replaces this placeholder; only <NotesSection /> stays.
function Home() {
  return (
    <main style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
      <BrandLogo size="compact" wordmarkSrc={wordmarkSrc} />

      <h1 style={{ marginTop: 'var(--sp-7)' }}>placeholder</h1>

      <p>
        This page renders the design system and nothing else. Its typography,
        its colours and its spacing all resolve to design-system tokens, and the
        wordmark above comes from the package&rsquo;s assets subpath.
      </p>

      <SkCallout style={{ marginTop: 'var(--sp-6)' }}>
        <p style={{ margin: 0 }}>
          Three faces are self-hosted by the site and handed to the design
          system through its named slots: this line is <code>--font-sans</code>,{' '}
          <span style={{ fontFamily: 'var(--font-script)' }}>this is</span>{' '}
          <code>--font-script</code>, and the two names in monospace are{' '}
          <code>--font-mono</code>.
        </p>
      </SkCallout>

      <NotesSection posts={Route.useLoaderData()} />
    </main>
  );
}
