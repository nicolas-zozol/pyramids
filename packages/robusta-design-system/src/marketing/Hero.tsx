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
    you can still{' '}
    <span className="sk-scribble sk-hero__title-scribble">maintain</span> in
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
    <span className="sk-check" />
    currently booking q3 · 2 slots left this quarter
  </>
);

/**
 * Marketing hero — headline + subtitle + dual CTA + mascot illustration.
 * All textual content is prop-driven with the original prototype copy as
 * the default (so consumers see the same surface out of the box).
 *
 * One column below `lg`, where the mascot sits under the copy and the
 * annotation with it; the two-column split and the pointing squiggle are
 * `.sk-hero`'s business in `sketch.css`.
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
  const merged = ['sk-hero', className].filter(Boolean).join(' ');

  return (
    <section className={merged} style={style}>
      <div className="sk-hero__grid">
        <div className="sk-hero__copy">
          <div className="sk-hero__eyebrow">
            <SkArrowRight
              width={38}
              verticalAlign="middle"
              className="sk-hero__eyebrow-arrow"
            />
            {eyebrow}
          </div>
          <h1 className="sk-hero__title">{title}</h1>
          <p className="sk-hero__subtitle">{subtitle}</p>
          <div className="sk-hero__actions">
            {primaryCtaLabel ? (
              <SkButton variant="primary" href={primaryCtaHref}>
                {primaryCtaLabel}
              </SkButton>
            ) : null}
            {secondaryCtaLabel ? (
              <SkButton href={secondaryCtaHref}>{secondaryCtaLabel}</SkButton>
            ) : null}
          </div>
          {footnote ? (
            <div className="sk-hero__footnote">{footnote}</div>
          ) : null}
        </div>

        <div className="sk-hero__figure">
          {mascotSrc ? (
            <img className="sk-hero__mascot" src={mascotSrc} alt="crystal tux" />
          ) : null}
          <div className="sk-hero__annotation">
            this is crystal tux.
            <br />
            she lives here.
          </div>
          <svg className="sk-hero__doodle" viewBox="0 0 80 60" aria-hidden="true">
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
