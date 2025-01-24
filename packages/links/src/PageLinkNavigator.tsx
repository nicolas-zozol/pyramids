import { PageLink } from './PageLink';
import React from 'react';

interface PageLinkNavigatorProps {
  pages: { name: string; href: string; currentPathName: string }[];
}

export const PageLinkNavigator = ({ pages }: PageLinkNavigatorProps) => {
  return (
    <div className="flex space-x-4">
      {pages.map(({ name, href, currentPathName }) => (
        <PageLink
          key={href}
          name={name}
          href={href}
          active={currentPathName === href} // Check if the current page is the one in the link
        />
      ))}
    </div>
  );
};
