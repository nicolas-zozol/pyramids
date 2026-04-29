import type { CSSProperties, InputHTMLAttributes } from 'react';

export interface SkInputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Optional outer wrapper width / height; useful for hero email inputs. */
  wrapperStyle?: CSSProperties;
  wrapperClassName?: string;
}

/**
 * Hand-drawn text input. Renders `<div class="sk-input-wrap"><input class="sk-input" /></div>`
 * to match the prototype markup. Server-component-safe.
 */
export function SkInput({
  wrapperStyle,
  wrapperClassName = '',
  className = '',
  style,
  ...rest
}: SkInputProps) {
  const wrapClass = ['sk-input-wrap', wrapperClassName].filter(Boolean).join(' ');
  const inputClass = ['sk-input', className].filter(Boolean).join(' ');
  return (
    <div className={wrapClass} style={wrapperStyle}>
      <input className={inputClass} style={style} {...rest} />
    </div>
  );
}
