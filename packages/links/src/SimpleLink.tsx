import Link from 'next/link';
import React from 'react';

interface SimpleLinkProps {
  href?: string;
  children: React.ReactNode;
  dofollow?: boolean;
}

export const SimpleLink: React.FC<SimpleLinkProps> = ({
  children,
  href,
  dofollow = false,
}) => {
  href = href || '';
  const isOut = href.startsWith('http');

  const relValues = 'noopener noreferrer' + (dofollow ? '' : ' nofollow');

  if (isOut) {
    return (
      <Link href={href} target="_blank" rel={relValues}>
        {children}
      </Link>
    );
  } else {
    return (
      <Link href={href} className={'text-blue-500 hover:text-blue-700'}>
        {children}
      </Link>
    );
  }
};
