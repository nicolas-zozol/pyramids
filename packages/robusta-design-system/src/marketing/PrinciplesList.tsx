import type { CSSProperties } from 'react';

export interface Principle {
  /** Bold key line. */
  k: string;
  /** Sub-line caption. */
  v: string;
}

export interface PrinciplesListProps {
  eyebrow?: string;
  title?: string;
  principles?: Principle[];
  className?: string;
  style?: CSSProperties;
}

/**
 * List of values, sketchnote bullet style. Each row is a checkmark + bold
 * key line + sub caption. One column below `sm`, two above.
 */
export function PrinciplesList({
  eyebrow,
  title,
  principles = [],
  className,
  style,
}: PrinciplesListProps) {
  const merged = ['sk-principles-list', className].filter(Boolean).join(' ');

  return (
    <section className={merged} style={style}>
      <div className="sk-principles-list__head">
        {eyebrow ? (
          <div className="sk-principles-list__eyebrow">{eyebrow}</div>
        ) : null}
        {title ? <h2 className="sk-principles-list__title">{title}</h2> : null}
      </div>
      <ul className="sk-principles-list__items">
        {principles.map((it, i) => (
          <li key={i} className="sk-principles-list__item">
            <span className="sk-check sk-principles-list__check" />
            <div>
              <div className="sk-principles-list__key">{it.k}</div>
              <div className="sk-principles-list__value">{it.v}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
