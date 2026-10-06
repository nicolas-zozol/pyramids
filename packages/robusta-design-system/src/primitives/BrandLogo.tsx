import type { CSSProperties } from 'react';

export interface BrandLogoProps {
  /**
   * Visual variant.
   * - `compact` — emoji marks + wordmark image, sized for nav. (default)
   * - `full`    — same lockup at hero scale, with tagline below.
   * - `mark`    — just the two emoji glyphs, no wordmark.
   */
  size?: 'compact' | 'full' | 'mark';
  /** Rendered by the `full` variant alone. Empty: no tagline line. */
  tagline?: string;
  /**
   * Path or imported module URL for the wordmark PNG. Defaults to the
   * subpath import string `@robusta/pyramids-design-system/assets/robusta-build-wordmark.png`,
   * which works in any Next.js / Vite / Webpack consumer. For the best
   * Next.js asset optimization, pass an imported StaticImageData URL:
   *
   *   import wordmark from '@robusta/pyramids-design-system/assets/robusta-build-wordmark.png';
   *   <BrandLogo wordmarkSrc={typeof wordmark === 'string' ? wordmark : wordmark.src} />
   */
  wordmarkSrc?: string;
  /** Inline style escape hatch for tiny per-page nudges. */
  style?: CSSProperties;
  className?: string;
}

const WORDMARK_RATIO = 1603 / 312; // ≈ 5.14
const DEFAULT_WORDMARK_SRC =
  '/_next/static/media/robusta-build-wordmark.png'; // overridden in practice — see prop docs

const emojiStyle = (h: number): CSSProperties => ({
  fontSize: h,
  lineHeight: 1,
  fontFamily:
    "'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif",
});

/** The 💪 + 🏗 + "robusta build" wordmark lockup, its `full` variant carrying the tagline beneath. */
export function BrandLogo({
  size = 'compact',
  tagline = 'senior engineering, hand-built.',
  wordmarkSrc = DEFAULT_WORDMARK_SRC,
  style,
  className,
}: BrandLogoProps) {
  const rootClass = ['sk-brand-logo', className].filter(Boolean).join(' ');

  if (size === 'mark') {
    return (
      <span
        className={rootClass}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 12,
          ...style,
        }}
      >
        <span style={emojiStyle(56)}>💪</span>
        <span style={emojiStyle(56)}>🏗</span>
      </span>
    );
  }

  // Heights tuned so the wordmark optically matches the emoji cap-height.
  // Wordmark image includes the underline + descenders, so it's ~1.4× cap height.
  const emojiH = size === 'full' ? 56 : 36;
  const wordmarkH = size === 'full' ? 76 : 50;
  const wordmarkW = wordmarkH * WORDMARK_RATIO;
  const gap = size === 'full' ? 16 : 10;

  return (
    <span
      className={rootClass}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        ...style,
      }}
    >
      <span
        className="sk-brand-logo__lockup"
        style={{ display: 'inline-flex', alignItems: 'center', gap }}
      >
        <span style={emojiStyle(emojiH)}>💪</span>
        <span style={emojiStyle(emojiH)}>🏗</span>
        <img
          className="sk-brand-logo__wordmark"
          src={wordmarkSrc}
          alt="Robusta Build"
          width={wordmarkW}
          height={wordmarkH}
          style={{
            display: 'block',
            // Nudge up slightly so the wordmark's optical baseline aligns with emoji.
            marginTop: size === 'full' ? -4 : -3,
            marginLeft: size === 'full' ? 4 : 2,
            imageRendering: 'auto',
          }}
        />
      </span>
      {size === 'full' && tagline ? (
        <span
          className="sk-brand-logo__tagline"
          style={{ marginLeft: emojiH * 2 + gap * 2 }}
        >
          {tagline}
        </span>
      ) : null}
    </span>
  );
}
