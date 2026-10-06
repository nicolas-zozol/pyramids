import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

interface SiteLinkProps {
  /** A URL `buildUrl` produced. */
  href: string;
  hrefLang?: string;
  lang?: string;
  children: ReactNode;
}

const CURRENT_PAGE_ONLY = { exact: true };

/** The one place a built URL becomes a router link, so no route path is composed elsewhere. */
export function SiteLink({ href, hrefLang, lang, children }: SiteLinkProps) {
  return (
    <Link
      to={href}
      hrefLang={hrefLang}
      lang={lang}
      activeOptions={CURRENT_PAGE_ONLY}
    >
      {children}
    </Link>
  );
}
