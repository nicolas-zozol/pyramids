import type { SkLinkProps } from '@robusta/pyramids-design-system';
import { Link } from '@tanstack/react-router';

const CURRENT_PAGE_ONLY = { exact: true };
const NO_ACTIVE_CLASS = {};

/** The one place a built URL becomes a router link, and the link component the site hands the design system. */
export function SiteLink({ href, children, ...anchor }: SkLinkProps) {
  return (
    <Link
      {...anchor}
      to={href}
      activeOptions={CURRENT_PAGE_ONLY}
      activeProps={NO_ACTIVE_CLASS}
    >
      {children}
    </Link>
  );
}
