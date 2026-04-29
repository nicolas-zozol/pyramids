import type { CSSProperties, ReactNode } from 'react';
import { SkArrowRight } from '../primitives/SkArrowRight.js';
import { SkButton } from '../primitives/SkButton.js';

export interface HeroProps {
  /** Small overline label above the headline. */
  eyebrow?: string;
  /**
   * Main headline. Pass a `ReactNode` if you want inline scribble/highlight
   * spans (e.g. `<span className="highlight-yellow">five years.</span>`).
   * Default preserves the original prototype copy with sketch decorations.
   */
  title?: ReactNode;
  /** Sub-paragraph below the headline. */
  subtitle?: ReactNode;
  /** Primary CTA label. Empty string hides the button. */
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  /** Secondary CTA label. Empty string hides the button. */
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
  /** Footnote line beneath the CTA row (e.g. availability indicator). */
  footnote?: ReactNode;
  /**
   * Path/URL for the mascot SVG. Defaults to a relative path that consumers
   * MUST override with an imported asset URL — see README "asset imports".
   */
  mascotSrc?: string;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_TITLE = (
  <>
    we build software
    <br />
    you can still <span className="sk-scribble" style={{ marginRight: 14 }}>maintain</span> in
    <br />
    <span className="highlight-yellow">five years.</span>
  </>
);

const DEFAULT_SUBTITLE = (
  <>
    small team. long memory. for high-stakes systems where
    <span className="highlight-blue">
      {' '}architecture, reliability, and the next engineer
    </span>{' '}
    all matter.
  </>
);

const DEFAULT_FOOTNOTE = (
  <>
    <span className="sk-check" style={{ display: 'inline-block', marginRight: 10 }} />
    currently booking q3 · 2 slots left this quarter
  </>
);

const sansBlock: CSSProperties = { fontFamily: 'var(--font-sans)' };

/**
 * Marketing hero — headline + subtitle + dual CTA + mascot illustration.
 * All textual content is prop-driven with the original prototype copy as
 * the default (so consumers see the same surface out of the box).
 */
export function Hero({
  eyebrow = 'independent senior engineering',
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  primaryCtaLabel = 'book a call →',
  primaryCtaHref = '#book',
  secondaryCtaLabel = 'read a sample audit',
  secondaryCtaHref = '#audit',
  footnote = DEFAULT_FOOTNOTE,
  mascotSrc = '',
  className,
  style,
}: HeroProps) {
  return (
    <section
      className={className}
      style={{ padding: '64px 48px 32px', position: 'relative', ...style }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.3fr 1fr',
          gap: 48,
          alignItems: 'center',
        }}
      >
        <div>
          <div
            style={{
              ...sansBlock,
              fontSize: 17,
              color: 'var(--ink-mute)',
              marginBottom: 18,
            }}
          >
            <SkArrowRight width={38} verticalAlign="middle" style={{ marginRight: 8 }} />
            {eyebrow}
          </div>
          <h1
            style={{
              ...sansBlock,
              fontWeight: 600,
              fontSize: 88,
              lineHeight: 1.05,
              margin: 0,
              letterSpacing: '-1px',
              color: 'var(--ink)',
            }}
          >
            {title}
          </h1>
          <p
            style={{
              ...sansBlock,
              fontSize: 21,
              lineHeight: 1.45,
              color: 'var(--ink-soft)',
              marginTop: 28,
              maxWidth: 520,
            }}
          >
            {subtitle}
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 36 }}>
            {primaryCtaLabel ? (
              <SkButton variant="primary">
                <a
                  href={primaryCtaHref}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {primaryCtaLabel}
                </a>
              </SkButton>
            ) : null}
            {secondaryCtaLabel ? (
              <SkButton>
                <a
                  href={secondaryCtaHref}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {secondaryCtaLabel}
                </a>
              </SkButton>
            ) : null}
          </div>
          {footnote ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginTop: 28,
                ...sansBlock,
                fontSize: 15,
                color: 'var(--ink-mute)',
              }}
            >
              {footnote}
            </div>
          ) : null}
        </div>

        <div style={{ position: 'relative', textAlign: 'center' }}>
          {mascotSrc ? (
            <img src={mascotSrc} alt="crystal tux" style={{ height: 360 }} />
          ) : null}
          <div
            style={{
              position: 'absolute',
              top: 30,
              right: 0,
              ...sansBlock,
              fontSize: 14,
              color: 'var(--ink-mute)',
              transform: 'rotate(4deg)',
            }}
          >
            this is crystal tux.
            <br />
            she lives here.
          </div>
          <svg
            style={{ position: 'absolute', top: 60, right: 50, width: 80, height: 60 }}
            viewBox="0 0 80 60"
            aria-hidden="true"
          >
            <path
              d="M70,10 Q40,20 20,40"
              stroke="var(--ink)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M22,32 L18,42 L28,42"
              stroke="var(--ink)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
