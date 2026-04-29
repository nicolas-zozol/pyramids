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

const sansBlock: CSSProperties = { fontFamily: 'var(--font-sans)' };

/**
 * Two-column list of values, sketchnote bullet style. Each row is a
 * checkmark + bold key line + sub caption.
 */
export function PrinciplesList({
  eyebrow = '// what we believe',
  title = 'principles, written down.',
  principles = DEFAULT_PRINCIPLES,
  className,
  style,
}: PrinciplesListProps) {
  return (
    <section className={className} style={{ padding: '72px 48px', ...style }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ ...sansBlock, fontSize: 15, color: 'var(--ink-mute)', marginBottom: 6 }}>
          {eyebrow}
        </div>
        <h2 style={{ ...sansBlock, fontSize: 56, margin: 0, lineHeight: 1, color: 'var(--ink)' }}>
          {title}
        </h2>
      </div>
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '22px 56px',
        }}
      >
        {principles.map((it, i) => (
          <li key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <span className="sk-check" style={{ flexShrink: 0, marginTop: 4 }} />
            <div>
              <div
                style={{
                  ...sansBlock,
                  fontWeight: 700,
                  fontSize: 19,
                  color: 'var(--ink)',
                  lineHeight: 1.3,
                }}
              >
                {it.k}
              </div>
              <div
                style={{
                  ...sansBlock,
                  fontSize: 15,
                  color: 'var(--ink-mute)',
                  marginTop: 2,
                }}
              >
                {it.v}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
