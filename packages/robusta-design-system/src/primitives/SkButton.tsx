import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface SkButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Visual variant — maps to `.sk-btn--primary` / `.sk-btn--ghost` */
  variant?: 'primary' | 'ghost' | 'default';
  children: ReactNode;
}

/**
 * Hand-drawn sketchnote button. Pure presentational wrapper over the
 * `.sk-btn` family of CSS classes shipped in `sketch.css`.
 *
 * Server-component-safe by default. If you need an `onClick`, wrap this
 * in a client component on the consumer side.
 */
export function SkButton({
  variant = 'default',
  className = '',
  children,
  ...rest
}: SkButtonProps) {
  const variantClass =
    variant === 'primary'
      ? 'sk-btn--primary'
      : variant === 'ghost'
        ? 'sk-btn--ghost'
        : '';
  const merged = ['sk-btn', variantClass, className].filter(Boolean).join(' ');
  return (
    <button className={merged} {...rest}>
      {children}
    </button>
  );
}
