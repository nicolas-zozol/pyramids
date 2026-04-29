import type { CSSProperties } from 'react';

export interface SkArrowRightProps {
  /** Pixel width of the arrow. Defaults to 40. */
  width?: number;
  /** Vertical alignment for inline use. */
  verticalAlign?: CSSProperties['verticalAlign'];
  className?: string;
  style?: CSSProperties;
}

/**
 * Hand-drawn rightward arrow. Renders an empty `<span class="sk-arrow-right" />`
 * — the actual arrow is the SVG background defined in `sketch.css`.
 */
export function SkArrowRight({
  width = 40,
  verticalAlign,
  className = '',
  style,
}: SkArrowRightProps) {
  const merged = ['sk-arrow-right', className].filter(Boolean).join(' ');
  const finalStyle: CSSProperties = {
    display: 'inline-block',
    width,
    verticalAlign,
    ...style,
  };
  return <span className={merged} style={finalStyle} aria-hidden="true" />;
}
