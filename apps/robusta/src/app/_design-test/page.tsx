// Smoke test for @robusta/pyramids-design-system.
//
// Validates that:
//  - the package's CSS subpath exports resolve under Next.js 15
//  - asset subpath imports resolve and produce a hashed URL
//  - server-component primitives render
//
// This page is in a `_design-test/` private folder — Next.js won't expose it
// as a route (folders prefixed with `_` are excluded from routing). It exists
// only so `yarn build:robusta` exercises the package wiring. Delete after
// the live home page is rebuilt against the design system.

import '@robusta/pyramids-design-system/colors_and_type.css';
import '@robusta/pyramids-design-system/sketch.css';

import wordmark from '@robusta/pyramids-design-system/assets/robusta-build-wordmark.png';
import { BrandLogo, SkButton, SkTag } from '@robusta/pyramids-design-system';

export default function DesignTestPage() {
  // `wordmark` is a `StaticImageData` under Next.js — we want the URL string.
  const wordmarkSrc =
    typeof wordmark === 'string' ? wordmark : (wordmark as { src: string }).src;

  return (
    <main style={{ padding: 32 }}>
      <h1 style={{ fontFamily: 'var(--font-sans)', color: 'var(--ink)' }}>
        design-system smoke test
      </h1>

      <section style={{ margin: '24px 0' }}>
        <BrandLogo size="full" wordmarkSrc={wordmarkSrc} />
      </section>

      <section style={{ display: 'flex', gap: 12, margin: '24px 0' }}>
        <SkButton variant="primary">primary</SkButton>
        <SkButton>default</SkButton>
        <SkButton variant="ghost">ghost</SkButton>
      </section>

      <section style={{ display: 'flex', gap: 12, margin: '24px 0' }}>
        <SkTag>default</SkTag>
        <SkTag tone="pink">pink</SkTag>
        <SkTag tone="blue">blue</SkTag>
        <SkTag tone="green">green</SkTag>
      </section>
    </main>
  );
}
