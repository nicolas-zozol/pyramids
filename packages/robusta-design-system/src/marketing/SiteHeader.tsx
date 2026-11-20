import type { CSSProperties } from 'react';
import { BrandLogo } from '../primitives/BrandLogo.tsx';
import { SkButton } from '../primitives/SkButton.tsx';
import { PlainLink, type SkLinkComponent } from '../primitives/SkLink.tsx';

export interface NavLink {
  label: string;
  href: string;
  /** The language of the page the link leads to, written as its `lang` and `hrefLang`. */
  locale?: string;
  /** Set in bold: the name of a product. */
  emphasis?: boolean;
}

export interface SiteHeaderProps {
  /** Path/URL string for the wordmark SVG used by the embedded `<BrandLogo>`. */
  wordmarkSrc?: string;
  /** The wordmark's target, `/` when absent. */
  homeHref?: string;
  /** The site's own pages, first in the nav; a link with `emphasis` is set in bold. */
  sections?: NavLink[];
  /** Nav links rendered between the sections and the CTA: the other languages. */
  links?: NavLink[];
  /** Right-aligned CTA button label. Set to empty string to hide the button. */
  ctaLabel?: string;
  /** Href for the CTA button. */
  ctaHref?: string;
  /** Renders the section's anchors, a router link for instance; a plain `<a>` when absent. */
  linkComponent?: SkLinkComponent;
  className?: string;
  style?: CSSProperties;
}

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
  sections = [],
  links = [],
  ctaLabel,
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
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className={
              s.emphasis
                ? 'sk-site-header__section sk-site-header__section--product'
                : 'sk-site-header__section'
            }
          >
            {s.label}
          </Link>
        ))}
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
