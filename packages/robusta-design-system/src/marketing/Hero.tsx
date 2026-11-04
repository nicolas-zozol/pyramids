import type { CSSProperties, ReactNode } from 'react';
import { SkArrowRight } from '../primitives/SkArrowRight.tsx';
import { SkButton } from '../primitives/SkButton.tsx';
import type { SkLinkComponent } from '../primitives/SkLink.tsx';

export interface HeroProps {
  /** Small overline label above the headline. */
  eyebrow?: string;
  /**
   * Main headline. Pass a `ReactNode` if you want inline scribble/highlight
   * spans (e.g. `<span className="highlight-yellow">five years.</span>`).
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
  /** Renders the surface's anchors, a router link for instance; a plain `<a>` when absent. */
  linkComponent?: SkLinkComponent;
  className?: string;
  style?: CSSProperties;
}

/** Marketing hero — headline, subtitle, two calls to action and the captioned mascot; each text a prop, its element rendered only when the text is given. */
export function Hero({
  eyebrow,
  title,
  subtitle,
  primaryCtaLabel,
  primaryCtaHref = '#book',
  secondaryCtaLabel,
  secondaryCtaHref = '#audit',
  footnote,
  mascotSrc = '',
  mascotAlt = '',
  annotation,
  linkComponent,
  className,
  style,
}: HeroProps) {
  const merged = ['sk-hero', className].filter(Boolean).join(' ');

  return (
    <section className={merged} style={style}>
      <div className="sk-hero__grid">
        <div className="sk-hero__copy">
          {eyebrow ? (
            <div className="sk-hero__eyebrow">
              <SkArrowRight
                width={38}
                verticalAlign="middle"
                className="sk-hero__eyebrow-arrow"
              />
              {eyebrow}
            </div>
          ) : null}
          {title ? <h1 className="sk-hero__title">{title}</h1> : null}
          {subtitle ? <p className="sk-hero__subtitle">{subtitle}</p> : null}
          <div className="sk-hero__actions">
            {primaryCtaLabel ? (
              <SkButton
                variant="primary"
                href={primaryCtaHref}
                linkComponent={linkComponent}
              >
                {primaryCtaLabel}
              </SkButton>
            ) : null}
            {secondaryCtaLabel ? (
              <SkButton href={secondaryCtaHref} linkComponent={linkComponent}>
                {secondaryCtaLabel}
              </SkButton>
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
