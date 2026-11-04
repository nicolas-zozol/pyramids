import type { CSSProperties } from 'react';
import { SkButton } from '../primitives/SkButton.tsx';
import type { SkLinkComponent } from '../primitives/SkLink.tsx';
import { SkInput } from '../primitives/SkInput.tsx';

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
  /** Renders the section's anchors, a router link for instance; a plain `<a>` when absent. */
  linkComponent?: SkLinkComponent;
  className?: string;
  style?: CSSProperties;
}

/**
 * Closing call-to-action: waving-tux mascot + headline + email + button.
 * The headline shares `--t-display` with the hero's — one section, one
 * largest text.
 *
 * Server-component-safe; consumer should wrap the email field in a client
 * form when wiring submit behavior.
 */
export function CTA({
  title,
  subtitle,
  emailPlaceholder,
  ctaLabel,
  ctaHref = '#book',
  footnote,
  mascotSrc = '',
  linkComponent,
  className,
  style,
}: CTAProps) {
  const merged = ['sk-cta', className].filter(Boolean).join(' ');

  return (
    <section className={merged} style={style}>
      {mascotSrc ? (
        <img className="sk-cta__mascot" src={mascotSrc} alt="" />
      ) : null}
      {title ? <h2 className="sk-cta__title">{title}</h2> : null}
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
          <SkButton
            variant="primary"
            href={ctaHref}
            linkComponent={linkComponent}
          >
            {ctaLabel}
          </SkButton>
        ) : null}
      </div>
      {footnote ? <div className="sk-cta__footnote">{footnote}</div> : null}
    </section>
  );
}
