import React from 'react';
import { PageLink } from '../standard';

interface PageLinkNavigatorProps {
  pages: { name: string; href: string }[];
  currentPathName: string;
}

export const PageLinkNavigator = ({
  pages,
  currentPathName,
}: PageLinkNavigatorProps) => {
  return (
    <div className="flex space-x-4">
      {pages.map(({ name, href }) => (
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
