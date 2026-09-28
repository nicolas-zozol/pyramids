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

const DEFAULT_PRINCIPLES: Principle[] = [
  { k: 'we read before we write.', v: 'no commits in the first week. promise.' },
  {
    k: 'boring tech, on purpose.',
    v: 'postgres, sql, http. fewer moving parts is the feature.',
  },
  {
    k: 'the next engineer matters most.',
    v: 'every choice is a memo to whoever inherits it.',
  },
  {
    k: "we don't take work we can't finish.",
    v: 'small slate. long horizons. quarter-shaped projects.',
  },
  {
    k: 'tests are documentation.',
    v: "if it isn't covered, we don't know how it should behave.",
  },
  {
    k: 'incidents are not surprises.',
    v: 'they are the signal that an invariant was wrong.',
  },
];

/**
 * List of values, sketchnote bullet style. Each row is a checkmark + bold
 * key line + sub caption. One column below `sm`, two above.
 */
export function PrinciplesList({
  eyebrow = '// what we believe',
  title = 'principles, written down.',
  principles = DEFAULT_PRINCIPLES,
  className,
  style,
}: PrinciplesListProps) {
  const merged = ['sk-principles-list', className].filter(Boolean).join(' ');

  return (
    <section className={merged} style={style}>
      <div className="sk-principles-list__head">
        <div className="sk-principles-list__eyebrow">{eyebrow}</div>
        <h2 className="sk-principles-list__title">{title}</h2>
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
