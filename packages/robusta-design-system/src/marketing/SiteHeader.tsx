import type { CSSProperties } from 'react';
import { BrandLogo } from '../primitives/BrandLogo.js';
import { SkButton } from '../primitives/SkButton.js';

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteHeaderProps {
  /** Path/URL string for the wordmark PNG used by the embedded `<BrandLogo>`. */
  wordmarkSrc?: string;
  /** Nav links rendered between the logo and the CTA. */
  links?: NavLink[];
  /** Right-aligned CTA button label. Set to empty string to hide the button. */
  ctaLabel?: string;
  /** Href for the CTA button. */
  ctaHref?: string;
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: 'work', href: '#work' },
  { label: 'approach', href: '#approach' },
  { label: 'notes', href: '#notes' },
  { label: 'about', href: '#about' },
];

const navLinkStyle: CSSProperties = {
  fontFamily: 'var(--font-sans)',
  fontSize: 18,
  color: 'var(--ink)',
  textDecoration: 'none',
};

/**
 * Top nav: logo on the left, link list + primary CTA on the right.
 * Server-component-safe; if you want client-side click handling, wrap
 * the CTA in a client component on the consumer side.
 */
export function SiteHeader({
  wordmarkSrc,
  links = DEFAULT_LINKS,
  ctaLabel = 'book a call',
  ctaHref = '#book',
  className,
  style,
}: SiteHeaderProps) {
  return (
    <header
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 48px',
        borderBottom: '1.5px dashed var(--ink-faint)',
        ...style,
      }}
    >
      <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
        <BrandLogo size="compact" wordmarkSrc={wordmarkSrc} />
      </a>
      <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {links.map((l) => (
          <a key={l.href} href={l.href} style={navLinkStyle}>
            {l.label}
          </a>
        ))}
        {ctaLabel ? (
          <SkButton variant="primary" style={{ marginLeft: 8 }}>
            <a
              href={ctaHref}
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              {ctaLabel}
            </a>
          </SkButton>
        ) : null}
      </nav>
    </header>
  );
}
