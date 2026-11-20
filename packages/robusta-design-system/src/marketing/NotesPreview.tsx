import type { CSSProperties } from 'react';
import { PlainLink, type SkLinkComponent } from '../primitives/SkLink.tsx';
import { SkTag, type SkTagTone } from '../primitives/SkTag.tsx';

export interface NotePost {
  title: string;
  href?: string;
  /** Short tag label, e.g. "distributed systems". Empty hides the tag. */
  tag?: string;
  tagTone?: SkTagTone;
  /** Where the tag leads, the page of its Category for instance; absent, the tag is no link. */
  tagHref?: string;
  /** Date label like "apr 12". */
  date: string;
  /** The date in three parts, the day in large between the month and the year; `date` alone when absent. */
  dateParts?: NoteDateParts;
  /** One or two lines under the title. */
  summary?: string;
}

/** A date as a note card writes it, one part a line. */
export interface NoteDateParts {
  month: string;
  day: string;
  year: string;
}

export interface NotesPreviewProps {
  eyebrow?: string;
  title?: string;
  /** Right-rail link label. Empty hides it. */
  allLinkLabel?: string;
  allLinkHref?: string;
  posts?: NotePost[];
  /** Renders the section's anchors, a router link for instance; a plain `<a>` when absent. */
  linkComponent?: SkLinkComponent;
  className?: string;
  style?: CSSProperties;
}

/**
 * The latest notes on the darker paper, a card each: the date down its left
 * edge, the title, the summary and the subject. The title's link covers the
 * card; the subject, when it has a destination, is a link of its own above it. One column below `lg`, two above.
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
          {title ? <h2 className="sk-notes-preview__title">{title}</h2> : null}
          {eyebrow ? (
            <p className="sk-notes-preview__eyebrow">{eyebrow}</p>
          ) : null}
        </div>
        {allLinkLabel ? (
          <Link href={allLinkHref} className="sk-notes-preview__all">
            {allLinkLabel}
          </Link>
        ) : null}
      </div>
      <ul className="sk-notes-preview__list">
        {posts.map((p, i) => (
          <li key={i} className="sk-notes-preview__item">
            <article className="sk-box sk-notes-preview__post">
              {p.dateParts ? (
                <span className="sk-notes-preview__date">
                  <span>{p.dateParts.month}</span>
                  <strong className="sk-notes-preview__day">
                    {p.dateParts.day}
                  </strong>
                  <span>{p.dateParts.year}</span>
                </span>
              ) : (
                <span className="sk-notes-preview__date">{p.date}</span>
              )}
              <Link
                href={p.href ?? '#'}
                className="sk-cover-link sk-notes-preview__post-title"
              >
                {p.title}
              </Link>
              {p.summary ? (
                <span className="sk-notes-preview__summary">{p.summary}</span>
              ) : null}
              {p.tag && p.tagHref ? (
                <Link href={p.tagHref} className="sk-notes-preview__tag-link">
                  <SkTag tone={p.tagTone}>{p.tag}</SkTag>
                </Link>
              ) : p.tag ? (
                <SkTag tone={p.tagTone} className="sk-notes-preview__tag">
                  {p.tag}
                </SkTag>
              ) : null}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
