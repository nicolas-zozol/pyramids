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
        <span className="text-primary font-bold">{name}</span>
      ) : (
        <Link href={href} className="link link-neutral">
          {name}
        </Link>
      )}
    </div>
  );
};
