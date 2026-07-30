import type { CSSProperties } from 'react';

export interface BrandLogoProps {
  /**
   * Visual variant.
   * - `compact` — emoji marks + wordmark image, sized for nav. (default)
   * - `full`    — same lockup at hero scale, with tagline below.
   * - `mark`    — just the two emoji glyphs, no wordmark.
   */
  size?: 'compact' | 'full' | 'mark';
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

/**
 * 💪 + 🏗 + scanned "robusta build" wordmark.
 *
 * The wordmark is a 1603×312 PNG (`assets/robusta-build-wordmark.png`); height
 * is tuned to sit a touch taller than the cap-height of the emoji so the marks
 * read as a single lockup.
 *
 * Server-component-safe.
 */
export function BrandLogo({
  size = 'compact',
  wordmarkSrc = DEFAULT_WORDMARK_SRC,
  style,
  className,
}: BrandLogoProps) {
  if (size === 'mark') {
    return (
      <span
        className={className}
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
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        ...style,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap }}>
        <span style={emojiStyle(emojiH)}>💪</span>
        <span style={emojiStyle(emojiH)}>🏗</span>
        <img
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
      {size === 'full' && (
        <span
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 14,
            color: 'var(--ink-mute)',
            marginTop: 10,
            marginLeft: emojiH * 2 + gap * 2,
          }}
        >
          senior engineering, hand-built.
        </span>
      )}
    </span>
  );
}
