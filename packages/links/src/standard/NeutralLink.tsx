import React from 'react';
import { twCss } from '@robusta/pyramids-helpers';
import Link from 'next/link';
import { SimpleLinkProps } from './SimpleLink';

export const NeutralLink: React.FC<SimpleLinkProps> = ({
  children,
  href,
  className = '',
}) => {
  href = href || '';

  const basicClass = 'link link-hover text-neutral-content';
  const classNames = twCss(basicClass, className);

  return (
    <Link href={href} className={classNames}>
      {children}
    </Link>
  );
};
