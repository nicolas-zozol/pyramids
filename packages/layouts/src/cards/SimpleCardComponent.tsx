import React from 'react';
import { mergeCss } from '@robusta/pyramids-helpers';

interface SimpleCardProps {
  children: string | React.ReactNode;
  className?: string;
}

export const SimpleCardComponent: React.FC<SimpleCardProps> = ({
  children,
  className,
}) => {
  const classes = mergeCss(
    'h-full rounded-lg bg-white p-4 shadow-md',
    className,
  );
  return <div className={classes}>{children}</div>;
};
