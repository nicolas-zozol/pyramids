import Link from 'next/link';
import React from 'react';

interface PageLinkProps {
  name: string;
  href: string;
  active: boolean;
}

export const PageLink = ({ name, href, active }: PageLinkProps) => {
  return (
    <div>
      {active ? (
        <span className="link link-neutral">{name}</span>
      ) : (
        <Link href={href} className="link link-primary">
          {name}
        </Link>
      )}
    </div>
  );
};
