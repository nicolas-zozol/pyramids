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

/**
 * Top nav: logo on the left, link list + primary CTA on the right. Below
 * `md` the three parts stack and centre; the layout lives in `.sk-site-header`
 * and its parts in `sketch.css`.
 *
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
  const merged = ['sk-site-header', className].filter(Boolean).join(' ');

  return (
    <header className={merged} style={style}>
      <a href="/" className="sk-site-header__brand">
        <BrandLogo size="compact" wordmarkSrc={wordmarkSrc} />
      </a>
      <nav className="sk-site-header__nav">
        {links.map((l) => (
          <a key={l.href} href={l.href} className="sk-site-header__link">
            {l.label}
          </a>
        ))}
        {ctaLabel ? (
          <SkButton variant="primary" href={ctaHref}>
            {ctaLabel}
          </SkButton>
        ) : null}
      </nav>
    </header>
  );
}
