import type { CSSProperties } from 'react';
import { SkArrowRight } from '../primitives/SkArrowRight.tsx';
import { PlainLink, type SkLinkComponent } from '../primitives/SkLink.tsx';
import { SkTag, type SkTagTone } from '../primitives/SkTag.tsx';

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
  /** Right-rail link label. Empty hides it. */
  allLinkLabel?: string;
  allLinkHref?: string;
  posts?: NotePost[];
  /** Renders the surface's anchors, a router link for instance; a plain `<a>` when absent. */
  linkComponent?: SkLinkComponent;
  className?: string;
  style?: CSSProperties;
}

/**
 * Engineering-blog preview grid: date + title + tag rows, one column below
 * `sm` and two above.
 */
export function NotesPreview({
  eyebrow,
  title,
  allLinkLabel,
  allLinkHref = '#notes',
  posts = [],
  linkComponent: Link = PlainLink,
  className,
  style,
}: NotesPreviewProps) {
  const merged = ['sk-notes-preview', className].filter(Boolean).join(' ');

  return (
    <section id="notes" className={merged} style={style}>
      <div className="sk-notes-preview__head">
        <div>
          {eyebrow ? (
            <div className="sk-notes-preview__eyebrow">{eyebrow}</div>
          ) : null}
          {title ? <h2 className="sk-notes-preview__title">{title}</h2> : null}
        </div>
        {allLinkLabel ? (
          <Link href={allLinkHref} className="sk-notes-preview__all">
            {allLinkLabel} <SkArrowRight width={50} verticalAlign="middle" />
          </Link>
        ) : null}
      </div>
      <div className="sk-notes-preview__list">
        {posts.map((p, i) => (
          <Link key={i} href={p.href ?? '#'} className="sk-notes-preview__post">
            <div className="sk-notes-preview__date">{p.date}</div>
            <div className="sk-notes-preview__post-body">
              <div className="sk-notes-preview__post-title">{p.title}</div>
              {p.tag ? (
                <div className="sk-notes-preview__tag-row">
                  <SkTag tone={p.tagTone}>{p.tag}</SkTag>
                </div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
