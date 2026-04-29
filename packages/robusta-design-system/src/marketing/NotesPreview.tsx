import type { CSSProperties } from 'react';
import { SkArrowRight } from '../primitives/SkArrowRight.js';
import { SkTag, type SkTagTone } from '../primitives/SkTag.js';

export interface NotePost {
  title: string;
  href?: string;
  /** Short tag label, e.g. "distributed systems". Empty hides the tag. */
  tag?: string;
  tagTone?: SkTagTone;
  /** Date label like "apr 12". */
  date: string;
}

export interface NotesPreviewProps {
  eyebrow?: string;
  title?: string;
  /** Right-rail link label ("all notes"). Empty hides it. */
  allLinkLabel?: string;
  allLinkHref?: string;
  posts?: NotePost[];
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_POSTS: NotePost[] = [
  {
    title: 'idempotency keys: a love letter',
    tag: 'distributed systems',
    tagTone: 'blue',
    date: 'apr 12',
  },
  {
    title: 'the audit memo we send every client',
    tag: 'process',
    tagTone: 'default',
    date: 'mar 28',
  },
  {
    title: 'why we still pick postgres',
    tag: 'opinions',
    tagTone: 'pink',
    date: 'mar 04',
  },
  {
    title: 'reading code is harder than writing it',
    tag: 'craft',
    tagTone: 'green',
    date: 'feb 19',
  },
];

const sansBlock: CSSProperties = { fontFamily: 'var(--font-sans)' };

/**
 * Engineering-blog preview grid. Two columns of date + title + tag rows.
 */
export function NotesPreview({
  eyebrow = '// notes from the desk',
  title = 'things we wrote down.',
  allLinkLabel = 'all notes',
  allLinkHref = '#notes',
  posts = DEFAULT_POSTS,
  className,
  style,
}: NotesPreviewProps) {
  return (
    <section
      id="notes"
      className={className}
      style={{ padding: '64px 48px', background: 'var(--paper-2)', ...style }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: 36,
        }}
      >
        <div>
          <div style={{ ...sansBlock, fontSize: 15, color: 'var(--ink-mute)', marginBottom: 6 }}>
            {eyebrow}
          </div>
          <h2 style={{ ...sansBlock, fontSize: 56, margin: 0, lineHeight: 1, color: 'var(--ink)' }}>
            {title}
          </h2>
        </div>
        {allLinkLabel ? (
          <a href={allLinkHref} style={{ ...sansBlock, fontSize: 17, color: 'var(--ink)', textDecoration: 'none' }}>
            {allLinkLabel}{' '}
            <SkArrowRight width={50} verticalAlign="middle" />
          </a>
        ) : null}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '22px 32px' }}>
        {posts.map((p, i) => (
          <a
            key={i}
            href={p.href ?? '#'}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              gap: 18,
              alignItems: 'flex-start',
              padding: '14px 0',
              borderBottom: '1.5px dashed var(--ink-faint)',
            }}
          >
            <div
              style={{
                ...sansBlock,
                fontSize: 14,
                color: 'var(--ink-mute)',
                minWidth: 56,
                paddingTop: 4,
              }}
            >
              {p.date}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...sansBlock, fontSize: 21, color: 'var(--ink)', lineHeight: 1.25 }}>
                {p.title}
              </div>
              {p.tag ? (
                <div style={{ marginTop: 8 }}>
                  <SkTag tone={p.tagTone}>{p.tag}</SkTag>
                </div>
              ) : null}
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
