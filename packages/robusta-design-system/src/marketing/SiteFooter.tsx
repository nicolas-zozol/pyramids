import type { CSSProperties } from 'react';
import { BrandLogo } from '../primitives/BrandLogo.js';

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
  /** Bottom-right line. Original prototype self-references the design system. */
  versionLine?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * The package knows no site's URL, so its own defaults declare no
 * destination and render as text. A site supplying `columns` supplies real
 * links — which is the only honest way for a design system to ship default
 * copy it cannot resolve.
 */
const DEFAULT_COLUMNS: FooterColumn[] = [
  {
    h: 'work',
    items: [
      { label: 'the audit' },
      { label: 'embedded eng' },
      { label: 'rebuild surgery' },
      { label: 'past projects' },
    ],
  },
  {
    h: 'notes',
    items: [
      { label: 'all posts' },
      { label: 'rss' },
      { label: 'on github' },
      { label: 'on bsky' },
    ],
  },
  {
    h: 'company',
    items: [
      { label: 'about' },
      { label: 'engagement notes' },
      { label: 'contact' },
      { label: 'privacy' },
    ],
  },
];

/**
 * Site footer — brand block + three link columns + bottom line. One column
 * below `sm`, two up to `lg`, and the 1.4fr/1fr/1fr/1fr row above.
 */
export function SiteFooter({
  wordmarkSrc,
  tagline = 'a small senior engineering practice.\nremote, distributed across europe + na.',
  columns = DEFAULT_COLUMNS,
  copyright = '© robusta build · made by hand, with care.',
  versionLine = '// v1.0 · the system you\'re reading is itself.',
  className,
  style,
}: SiteFooterProps) {
  const merged = ['sk-site-footer', className].filter(Boolean).join(' ');

  return (
    <footer className={merged} style={style}>
      <div className="sk-site-footer__brand">
        <BrandLogo size="compact" wordmarkSrc={wordmarkSrc} />
        <p className="sk-site-footer__tagline">{tagline}</p>
      </div>
      {columns.map((col) => (
        <div key={col.h} className="sk-site-footer__col">
          <div className="sk-site-footer__col-title">{col.h}</div>
          <ul className="sk-site-footer__items">
            {col.items.map((it) => (
              <li key={it.label}>
                {it.href ? (
                  <a href={it.href} className="sk-site-footer__link">
                    {it.label}
                  </a>
                ) : (
                  <span className="sk-site-footer__text">{it.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="sk-site-footer__bottom">
        <div>{copyright}</div>
        <div>{versionLine}</div>
      </div>
    </footer>
  );
}
