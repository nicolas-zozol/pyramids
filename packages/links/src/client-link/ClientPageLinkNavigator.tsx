// components/PageLinkNavigator.tsx
'use client';

import { usePathname } from 'next/navigation'; // Use the AppRouter to get the current URL
import React from 'react';
import { PageLink } from '../standard';

interface PageLinkNavigatorProps {
  pages: { name: string; href: string }[];
}

export const ClientPageLinkNavigator = ({ pages }: PageLinkNavigatorProps) => {
  const pathname = usePathname();
  return (
    <div className="flex space-x-4">
      Other demos :&nbsp;
      {pages.map(({ name, href }) => (
        <PageLink
          key={href}
          name={name}
          href={href}
          active={pathname === href} // Check if the current page is the one in the link
        />
      ))}
    </div>
  );
};
