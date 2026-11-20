import type { CSSProperties, ReactNode } from 'react';

/** One open question as an agent writes it: its key, the question, the one answer it proposes, why, and the answer it got. */
export interface QuestionEntry {
  /** `OQ-<infix>-<n>`, the entry's key in its document. */
  key: string;
  question: string;
  proposition: string;
  rationale: string;
  /** `lgtm`, or the reader's own answer. */
  resolution: string;
}

/** The field names of an entry, as the format writes them. */
export interface QuestionLabels {
  proposition: string;
  rationale: string;
  resolution: string;
}

export interface QuestionsListProps {
  /** The section's id, `open-questions` when absent. */
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  /** Paragraph between the title and the entries. */
  intro?: ReactNode;
  labels: QuestionLabels;
  entries?: QuestionEntry[];
  /** Line under the entries, what an answer may be. */
  legend?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Open questions as an agent writes them at the end of a document: each entry
 * a card, its field names in mono as in the file, the resolution washed in gold.
 * One column below `lg`, two above.
 */
export function QuestionsList({
  id = 'open-questions',
  eyebrow,
  title,
  intro,
  labels,
  entries = [],
  legend,
  className,
  style,
}: QuestionsListProps) {
  const merged = ['sk-questions-list', className].filter(Boolean).join(' ');

  return (
    <section id={id} className={merged} style={style}>
      <div className="sk-questions-list__head">
        {eyebrow ? (
          <div className="sk-questions-list__eyebrow">{eyebrow}</div>
        ) : null}
        {title ? <h2 className="sk-questions-list__title">{title}</h2> : null}
        {intro ? <p className="sk-questions-list__intro">{intro}</p> : null}
      </div>
      <div className="sk-questions-list__entries">
        {entries.map((entry) => (
          <article
            key={entry.key}
            className="sk-box sk-sticker sk-questions-list__entry"
          >
            <p className="sk-questions-list__question">
              <span className="sk-questions-list__key">{entry.key}</span>{' '}
              {entry.question}
            </p>
            <dl className="sk-questions-list__fields">
              <dt className="sk-questions-list__label">{labels.proposition}</dt>
              <dd className="sk-questions-list__value">{entry.proposition}</dd>
              <dt className="sk-questions-list__label">{labels.rationale}</dt>
              <dd className="sk-questions-list__value">{entry.rationale}</dd>
              <dt className="sk-questions-list__label">{labels.resolution}</dt>
              <dd className="sk-questions-list__value sk-questions-list__value--resolution">
                <span className="highlight-yellow">{entry.resolution}</span>
              </dd>
            </dl>
          </article>
        ))}
      </div>
      {legend ? <p className="sk-questions-list__legend">{legend}</p> : null}
    </section>
  );
}
