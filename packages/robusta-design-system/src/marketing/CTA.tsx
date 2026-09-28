import type { CSSProperties } from 'react';
import { SkButton } from '../primitives/SkButton.js';
import { SkInput } from '../primitives/SkInput.js';

export interface CTAProps {
  /** Big section headline. */
  title?: string;
  subtitle?: string;
  /** Email-input placeholder. Empty hides the input field. */
  emailPlaceholder?: string;
  /** Primary button label. Empty hides the button. */
  ctaLabel?: string;
  ctaHref?: string;
  /** Footnote line beneath the form. */
  footnote?: string;
  /** Path/URL for the waving-mascot SVG. Empty hides the mascot. */
  mascotSrc?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Closing call-to-action: waving-tux mascot + headline + email + button.
 * The headline shares `--t-display` with the hero's — one surface, one
 * largest text.
 *
 * Server-component-safe; consumer should wrap the email field in a client
 * form when wiring submit behavior.
 */
export function CTA({
  title = 'ok, ready when you are.',
  subtitle = "first call is 30 minutes, no slides. tell us what hurts. we'll tell you whether we're the right people to help.",
  emailPlaceholder = 'your email',
  ctaLabel = 'book a call →',
  ctaHref = '#book',
  footnote = 'no newsletter funnel. one human reads it. promise.',
  mascotSrc = '',
  className,
  style,
}: CTAProps) {
  const merged = ['sk-cta', className].filter(Boolean).join(' ');

  return (
    <section className={merged} style={style}>
      {mascotSrc ? (
        <img className="sk-cta__mascot" src={mascotSrc} alt="" />
      ) : null}
      <h2 className="sk-cta__title">{title}</h2>
      {subtitle ? <p className="sk-cta__subtitle">{subtitle}</p> : null}
      <div className="sk-cta__form">
        {emailPlaceholder ? (
          <SkInput
            type="email"
            placeholder={emailPlaceholder}
            wrapperClassName="sk-cta__email"
            className="sk-cta__email-field"
          />
        ) : null}
        {ctaLabel ? (
          <SkButton variant="primary" href={ctaHref}>
            {ctaLabel}
          </SkButton>
        ) : null}
      </div>
      {footnote ? <div className="sk-cta__footnote">{footnote}</div> : null}
    </section>
  );
}
