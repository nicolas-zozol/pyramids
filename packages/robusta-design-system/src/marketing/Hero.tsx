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
  /** Path/URL for the mascot SVG. Empty hides the mascot, not its caption. */
  mascotSrc?: string;
  /** Alt text of the mascot. Empty: the mascot is decorative, alt="". */
  mascotAlt?: string;
  /** Caption beside the mascot. Empty ('' or null): no caption, no doodle arrow. */
  annotation?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_ANNOTATION = (
  <>
    this is crystal tux.
    <br />
    she lives here.
  </>
);

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

/** Marketing hero — headline, subtitle, two calls to action and the captioned mascot, every text a prop defaulting to the prototype copy. */
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
  mascotAlt = 'crystal tux',
  annotation = DEFAULT_ANNOTATION,
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
            <img className="sk-hero__mascot" src={mascotSrc} alt={mascotAlt} />
          ) : null}
          {annotation ? (
            <>
              <div className="sk-hero__annotation">{annotation}</div>
              <svg
                className="sk-hero__doodle"
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
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
