import Link from 'next/link';
import React from 'react';
import { mergeCss } from '@robusta/pyramids-helpers';

export interface SimpleLinkProps {
  href?: string;
  children: React.ReactNode;
  dofollow?: boolean;
  className?: string;
}

export const SimpleLink: React.FC<SimpleLinkProps> = ({
  children,
  href,
  className = '',
  dofollow = false,
}) => {
  href = href || '';
  const isOut = href.startsWith('http');

  const relValues = 'noopener noreferrer' + (dofollow ? '' : ' nofollow');

  const basicClass = 'link link-primary';
  const classNames = mergeCss(basicClass, className);

  if (isOut) {
    return (
      <Link href={href} target="_blank" rel={relValues} className={classNames}>
        {children}
      </Link>
    );
  } else {
    return (
      <Link href={href} className={classNames}>
        {children}
      </Link>
    );
  }
};
