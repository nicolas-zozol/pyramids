import { BrandLogo, SkCallout } from '@robusta/pyramids-design-system';

import { wordmarkSrc } from '../design-system/assets.js';
import { NotesSection } from '../landing/NotesSection.js';

/**
 * Placeholder home page, carrying one real section.
 *
 * The wiring demonstration below exists to exercise the two CSS subpaths, the
 * asset subpath, a design-system component and the design tokens, and for
 * robusta-landing-page to delete. `<NotesSection />` is not part of it: it is
 * fed by the site's real articles and survives the page being rebuilt around it,
 * which is what the arbitration of 2026-08-01 asked for (R-MIGRATELEARN-45).
 * Deleting the placeholder means carrying one import and one element across.
 *
 * Mounting is English-only. `/l/fr` derives its params from `landingParams`, and
 * `urlSet` produces no landing URL, so the French landing pregenerates nothing
 * and there is no page to mount into; the same component takes `locale="fr"` the
 * day robusta-landing-page gives that page copy.
 *
 * A server component: no design-system component carries `'use client'`, so the
 * page needs no client boundary and stays statically generated even though it
 * reads the index (BR-PYRAMID-7).
 */
export default async function Home() {
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

      <NotesSection />
    </main>
  );
}
