import type { CSSProperties, ReactNode } from 'react';

export interface SkCalloutProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Speech-bubble framing for emphasized notes. Wraps the `.sk-callout`
 * class from `sketch.css`.
 */
export function SkCallout({ children, className = '', style }: SkCalloutProps) {
  const merged = ['sk-callout', className].filter(Boolean).join(' ');
  return (
    <div className={merged} style={style}>
      {children}
    </div>
  );
}
