import type { CSSProperties } from 'react';
import { BrandLogo } from '../primitives/BrandLogo.js';

export interface FooterColumn {
  /** Column heading. */
  h: string;
  /** Plain-string item labels — internally rendered as `<a href="#">`. */
  items: string[];
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

const DEFAULT_COLUMNS: FooterColumn[] = [
  { h: 'work', items: ['the audit', 'embedded eng', 'rebuild surgery', 'past projects'] },
  { h: 'notes', items: ['all posts', 'rss', 'on github', 'on bsky'] },
  { h: 'company', items: ['about', 'engagement notes', 'contact', 'privacy'] },
];

const sansBlock: CSSProperties = { fontFamily: 'var(--font-sans)' };

/**
 * Four-column site footer — brand block + three link columns + bottom line.
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
  return (
    <footer
      className={className}
      style={{
        padding: '36px 48px 56px',
        borderTop: '1.5px solid var(--ink)',
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
        gap: 36,
        ...style,
      }}
    >
      <div>
        <BrandLogo size="compact" wordmarkSrc={wordmarkSrc} />
        <p
          style={{
            ...sansBlock,
            fontSize: 15,
            color: 'var(--ink-mute)',
            marginTop: 14,
            maxWidth: 280,
            lineHeight: 1.4,
            whiteSpace: 'pre-line',
          }}
        >
          {tagline}
        </p>
      </div>
      {columns.map((col) => (
        <div key={col.h}>
          <div style={{ ...sansBlock, fontSize: 26, color: 'var(--ink)' }}>{col.h}</div>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '8px 0 0',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            {col.items.map((it) => (
              <li key={it}>
                <a
                  href="#"
                  style={{
                    ...sansBlock,
                    fontSize: 15,
                    color: 'var(--ink)',
                    textDecoration: 'none',
                  }}
                >
                  {it}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div
        style={{
          gridColumn: '1 / -1',
          display: 'flex',
          justifyContent: 'space-between',
          ...sansBlock,
          fontSize: 13,
          color: 'var(--ink-mute)',
          borderTop: '1.5px dashed var(--ink-faint)',
          paddingTop: 20,
          marginTop: 12,
        }}
      >
        <div>{copyright}</div>
        <div>{versionLine}</div>
      </div>
    </footer>
  );
}
