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

const sansBlock: CSSProperties = { fontFamily: 'var(--font-sans)' };

/**
 * Closing call-to-action: waving-tux mascot + headline + email + button.
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
  return (
    <section
      className={className}
      style={{ padding: '80px 48px', textAlign: 'center', position: 'relative', ...style }}
    >
      {mascotSrc ? (
        <img src={mascotSrc} alt="" style={{ height: 140, marginBottom: 8 }} />
      ) : null}
      <h2 style={{ ...sansBlock, fontSize: 76, margin: '12px 0 8px', lineHeight: 1, color: 'var(--ink)' }}>
        {title}
      </h2>
      {subtitle ? (
        <p style={{ ...sansBlock, fontSize: 19, color: 'var(--ink-soft)', maxWidth: 540, margin: '0 auto 32px' }}>
          {subtitle}
        </p>
      ) : null}
      <div
        style={{
          display: 'flex',
          gap: 16,
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        {emailPlaceholder ? (
          <SkInput
            type="email"
            placeholder={emailPlaceholder}
            wrapperStyle={{ width: 320, height: 52 }}
            style={{ height: 52 }}
          />
        ) : null}
        {ctaLabel ? (
          <SkButton variant="primary">
            <a href={ctaHref} style={{ color: 'inherit', textDecoration: 'none' }}>
              {ctaLabel}
            </a>
          </SkButton>
        ) : null}
      </div>
      {footnote ? (
        <div style={{ ...sansBlock, fontSize: 14, color: 'var(--ink-mute)', marginTop: 18 }}>
          {footnote}
        </div>
      ) : null}
    </section>
  );
}
