import type { ReactNode } from 'react';

export type SkTagTone = 'default' | 'pink' | 'blue' | 'green';

export interface SkTagProps {
  tone?: SkTagTone;
  children: ReactNode;
  className?: string;
}

/**
 * Small inline label. Pairs with the `.sk-tag` family in `sketch.css`.
 * `tone` maps to `.sk-tag--pink` / `--blue` / `--green`; default is the
 * neutral ink-on-paper tag.
 */
export function SkTag({ tone = 'default', children, className = '' }: SkTagProps) {
  const toneClass = tone === 'default' ? '' : `sk-tag--${tone}`;
  const merged = ['sk-tag', toneClass, className].filter(Boolean).join(' ');
  return <span className={merged}>{children}</span>;
}
