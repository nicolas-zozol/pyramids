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

/**
 * Engineering-blog preview grid: date + title + tag rows, one column below
 * `sm` and two above.
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
  const merged = ['sk-notes-preview', className].filter(Boolean).join(' ');

  return (
    <section id="notes" className={merged} style={style}>
      <div className="sk-notes-preview__head">
        <div>
          <div className="sk-notes-preview__eyebrow">{eyebrow}</div>
          <h2 className="sk-notes-preview__title">{title}</h2>
        </div>
        {allLinkLabel ? (
          <a href={allLinkHref} className="sk-notes-preview__all">
            {allLinkLabel} <SkArrowRight width={50} verticalAlign="middle" />
          </a>
        ) : null}
      </div>
      <div className="sk-notes-preview__list">
        {posts.map((p, i) => (
          <a key={i} href={p.href ?? '#'} className="sk-notes-preview__post">
            <div className="sk-notes-preview__date">{p.date}</div>
            <div className="sk-notes-preview__post-body">
              <div className="sk-notes-preview__post-title">{p.title}</div>
              {p.tag ? (
                <div className="sk-notes-preview__tag-row">
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
