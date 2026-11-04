import type { Crumb } from '../seo/index.ts';
import { SiteLink } from './SiteLink.tsx';

interface BreadcrumbProps {
  /** The accessible name of the nav, from the page copy of the page's Locale. */
  label: string;
  trail: Crumb[];
}

/** A breadcrumb trail in a named nav, an ordered list: a crumb with a url a link, one without the current page, in text. */
export function Breadcrumb({ label, trail }: BreadcrumbProps) {
  return (
    <nav aria-label={label} style={{ color: 'var(--fg-3)' }}>
      <ol
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--sp-2)',
          margin: 0,
          padding: 0,
        }}
      >
        {trail.map((crumb) => (
          <li key={crumb.label}>
            {crumb.url === undefined ? (
              <span aria-current="page">{crumb.label}</span>
            ) : (
              <SiteLink href={crumb.url}>{crumb.label}</SiteLink>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
