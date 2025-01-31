import React from 'react';
import { FaPhone } from 'react-icons/fa';
import { twCss } from '@robusta/pyramids-helpers';

interface FatCtaProps {
  center: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FatCta: React.FC<FatCtaProps> = ({
  center,
  children,
  className,
}) => {
  const classes = twCss(
    `bg-accent text-accent-content flex w-full max-w-[600px] items-center justify-center rounded-xl px-16 py-5 text-xl font-bold shadow-md transition-transform duration-200 hover:scale-105 hover:shadow-lg ${center ? 'mx-auto' : 'mx-0'}`,
    className,
  );

  return (
    <a
      href="https://www.linkedin.com/in/robustacode/"
      target="_blank"
      rel="noopener noreferrer"
      className={classes}
    >
      {children}
    </a>
  );
};
