import { BrandLogo, SkCallout } from '@robusta/pyramids-design-system';

import { wordmarkSrc } from '../design-system/assets.js';

/**
 * Placeholder home page.
 *
 * It exists to exercise the wiring end to end — the two CSS subpaths, the asset
 * subpath, a design-system component and the design tokens — and for
 * robusta-landing-page to delete. It carries no page copy: no pitch, no
 * navigation, no call to action, no article.
 *
 * A server component: no design-system component carries `'use client'`, so the
 * page needs no client boundary and stays statically generated.
 */
export default function Home() {
  return (
    <main style={{ padding: 'var(--sp-8) var(--sp-6)' }}>
      {/* `BrandLogo`'s own default is a hardcoded `/_next/static/media/…` path
          that is wrong for every consumer, so the prop is always passed. */}
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
          system through its named slots: this line is{' '}
          <code>--font-sans</code>,{' '}
          <span style={{ fontFamily: 'var(--font-script)' }}>this is</span>{' '}
          <code>--font-script</code>, and the two names in monospace are{' '}
          <code>--font-mono</code>.
        </p>
      </SkCallout>
    </main>
  );
}
