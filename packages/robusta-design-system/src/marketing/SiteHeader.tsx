import type { CSSProperties } from 'react';
import { BrandLogo } from '../primitives/BrandLogo.tsx';
import { SkButton } from '../primitives/SkButton.tsx';
import { PlainLink, type SkLinkComponent } from '../primitives/SkLink.tsx';

export interface NavLink {
  label: string;
  href: string;
  /** The language of the page the link leads to, written as its `lang` and `hrefLang`. */
  locale?: string;
}

export interface SiteHeaderProps {
  /** Path/URL string for the wordmark PNG used by the embedded `<BrandLogo>`. */
  wordmarkSrc?: string;
  /** The wordmark's target, `/` when absent. */
  homeHref?: string;
  /** Nav links rendered between the logo and the CTA. */
  links?: NavLink[];
  /** Right-aligned CTA button label. Set to empty string to hide the button. */
  ctaLabel?: string;
  /** Href for the CTA button. */
  ctaHref?: string;
  /** Renders the surface's anchors, a router link for instance; a plain `<a>` when absent. */
  linkComponent?: SkLinkComponent;
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
  homeHref = '/',
  links = DEFAULT_LINKS,
  ctaLabel = 'book a call',
  ctaHref = '#book',
  linkComponent: Link = PlainLink,
  className,
  style,
}: SiteHeaderProps) {
  const merged = ['sk-site-header', className].filter(Boolean).join(' ');

  return (
    <header className={merged} style={style}>
      <Link href={homeHref} className="sk-site-header__brand">
        <BrandLogo size="compact" wordmarkSrc={wordmarkSrc} />
      </Link>
      <nav className="sk-site-header__nav">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="sk-site-header__link"
            {...languageOf(l)}
          >
            {l.label}
          </Link>
        ))}
        {ctaLabel ? (
          <SkButton variant="primary" href={ctaHref} linkComponent={Link}>
            {ctaLabel}
          </SkButton>
        ) : null}
      </nav>
    </header>
  );
}

function languageOf({ locale }: NavLink) {
  return locale === undefined ? {} : { lang: locale, hrefLang: locale };
}
