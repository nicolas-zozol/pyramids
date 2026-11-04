import type { CSSProperties } from 'react';
import { BrandLogo } from '../primitives/BrandLogo.tsx';
import { PlainLink, type SkLinkComponent } from '../primitives/SkLink.tsx';

export interface FooterLink {
  /** The text of the item. */
  label: string;
  /** Absent when no destination is known: renders as text, never as an anchor. */
  href?: string;
}

export interface FooterColumn {
  /** Column heading. */
  h: string;
  items: FooterLink[];
}

export interface SiteFooterProps {
  /** Path/URL for the wordmark PNG used by the embedded `<BrandLogo>`. */
  wordmarkSrc?: string;
  /** Free-text tagline rendered next to the logo. */
  tagline?: string;
  columns?: FooterColumn[];
  /** Bottom-left line. */
  copyright?: string;
  /** Bottom-right line. */
  versionLine?: string;
  /** Renders the surface's anchors, a router link for instance; a plain `<a>` when absent. */
  linkComponent?: SkLinkComponent;
  className?: string;
  style?: CSSProperties;
}

/**
 * Site footer — brand block, its link columns, then the bottom line. One column
 * below `sm`, two up to `lg`, and the 1.4fr/1fr/1fr/1fr row above.
 */
export function SiteFooter({
  wordmarkSrc,
  tagline,
  columns = [],
  copyright,
  versionLine,
  linkComponent: Link = PlainLink,
  className,
  style,
}: SiteFooterProps) {
  const merged = ['sk-site-footer', className].filter(Boolean).join(' ');

  return (
    <footer className={merged} style={style}>
      <div className="sk-site-footer__brand">
        <BrandLogo size="compact" wordmarkSrc={wordmarkSrc} />
        {tagline ? <p className="sk-site-footer__tagline">{tagline}</p> : null}
      </div>
      {columns.map((col) => (
        <div key={col.h} className="sk-site-footer__col">
          <div className="sk-site-footer__col-title">{col.h}</div>
          <ul className="sk-site-footer__items">
            {col.items.map((it) => (
              <li key={it.label}>
                {it.href ? (
                  <Link href={it.href} className="sk-site-footer__link">
                    {it.label}
                  </Link>
                ) : (
                  <span className="sk-site-footer__text">{it.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="sk-site-footer__bottom">
        {copyright ? <div>{copyright}</div> : null}
        {versionLine ? <div>{versionLine}</div> : null}
      </div>
    </footer>
  );
}
