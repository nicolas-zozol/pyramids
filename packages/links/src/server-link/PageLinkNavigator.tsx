import React from 'react';
import { PageLink } from '../standard';
import { twCss } from '@robusta/pyramids-helpers';

interface PageLinkNavigatorProps {
  pages: { name: string; href: string }[];
  currentPathName: string;

  className?: string;
}

export const PageLinkNavigator = ({
  pages,
  currentPathName,
  className = '',
}: PageLinkNavigatorProps) => {
  return (
    <div className={twCss('flex space-x-4', className)}>
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
