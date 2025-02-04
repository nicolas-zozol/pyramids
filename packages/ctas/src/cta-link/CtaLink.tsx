import Link from 'next/link';
import React from 'react';
import { mergeCss } from '@robusta/pyramids-helpers';

interface SimpleLinkProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
  out?: boolean;
  dofollow?: boolean;
  uppercase?: boolean;
}

export const CtaLink: React.FC<SimpleLinkProps> = ({
  children,
  href,
  className = '',
  dofollow,
  out = false,
  uppercase = false,
}) => {
  href = href || '';

  let basicClass = 'link link-hover font-bold border-2 p-1';
  if (uppercase) basicClass += ' uppercase';
  const classNames = mergeCss(basicClass, className);

  return (
    <Link href={href} className={classNames}>
      {children}
    </Link>
  );
};
