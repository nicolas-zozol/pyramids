import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

interface SiteLinkProps {
  /** A URL `buildUrl` produced. */
  href: string;
  hrefLang?: string;
  lang?: string;
  children: ReactNode;
}

/** The one place a built URL becomes a router link, so no route path is composed elsewhere. */
export function SiteLink({ href, hrefLang, lang, children }: SiteLinkProps) {
  return (
    <Link to={href} hrefLang={hrefLang} lang={lang}>
      {children}
    </Link>
  );
}
