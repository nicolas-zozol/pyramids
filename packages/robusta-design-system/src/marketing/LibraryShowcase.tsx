import type { CSSProperties } from 'react';
import { PlainLink, type SkLinkComponent } from '../primitives/SkLink.tsx';
import type { ActionLink } from './HomeHero.tsx';

/** A run of a line of source: plain code, or a word of the library's own, set in gold. */
export type CodeRun = string | { key: string };

/** One line of source, at its indent: 0, 1 or 2 steps of two characters. */
export interface CodeLine {
  indent?: 0 | 1 | 2;
  runs: CodeRun[];
}

/** A piece of source, then what it returns. */
export interface LibraryRecipe {
  caption?: string;
  lines: CodeLine[];
  /** What the source returns, on a yellow sticker after an arrow. */
  result?: string;
  /** The arrow's accessible name, `returns`. */
  resultLabel?: string;
}

/** A word of the library, and what it means. */
export interface LibraryWord {
  term: string;
  meaning?: string;
  /** `secondary`, gold: a module; `primary`, purple: a combinator. */
  tone: 'primary' | 'secondary';
}

/** The install command: the tool in gold, then its arguments, and a note beside it. */
export interface LibraryInstall {
  tool: string;
  args: string;
  note?: string;
}

export interface LibraryShowcaseProps {
  /** The section's id, `library` when absent. */
  id?: string;
  title?: string;
  /** The tagline under the title, a line of comment in mono. */
  eyebrow?: string;
  lede?: string;
  /** Its proofs, each one behind a check mark. */
  ticks?: string[];
  recipes?: LibraryRecipe[];
  /** The line above the words. */
  wordsLead?: string;
  words?: LibraryWord[];
  install?: LibraryInstall;
  links?: ActionLink[];
  /** Renders the section's anchors, a router link for instance; a plain `<a>` when absent. */
  linkComponent?: SkLinkComponent;
  className?: string;
  style?: CSSProperties;
}

const INDENT = [
  '',
  ' sk-library-showcase__line--in',
  ' sk-library-showcase__line--in2',
];

/**
 * A code library shown by its code: a title and its proofs, recipes of source
 * on the night console each followed by what it returns, the few words to
 * learn, and the install command.
 */
export function LibraryShowcase({
  id = 'library',
  title,
  eyebrow,
  lede,
  ticks = [],
  recipes = [],
  wordsLead,
  words = [],
  install,
  links = [],
  linkComponent: Link = PlainLink,
  className,
  style,
}: LibraryShowcaseProps) {
  const merged = ['sk-library-showcase', className].filter(Boolean).join(' ');

  return (
    <section id={id} className={merged} style={style}>
      <div className="sk-library-showcase__intro">
        <div className="sk-library-showcase__head">
          {title ? (
            <h2 className="sk-library-showcase__title">{title}</h2>
          ) : null}
          {eyebrow ? (
            <p className="sk-library-showcase__eyebrow">{eyebrow}</p>
          ) : null}
          {lede ? <p className="sk-library-showcase__lede">{lede}</p> : null}
        </div>
        <ul className="sk-library-showcase__ticks">
          {ticks.map((tick, i) => (
            <li key={i} className="sk-library-showcase__tick">
              <span className="sk-check" aria-hidden="true" />
              <span>{tick}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="sk-library-showcase__recipes">
        {recipes.map((recipe, i) => (
          <figure key={i} className="sk-library-showcase__recipe">
            {recipe.caption ? (
              <figcaption className="sk-library-showcase__caption">
                {recipe.caption}
              </figcaption>
            ) : null}
            <pre className="sk-console">
              <code>
                {recipe.lines.map((line, n) => (
                  <span
                    key={n}
                    className={`sk-library-showcase__line${INDENT[line.indent ?? 0]}`}
                  >
                    {line.runs.length === 0
                      ? ' '
                      : line.runs.map((run, r) =>
                          typeof run === 'string' ? (
                            run
                          ) : (
                            <strong key={r} className="sk-console-agent">
                              {run.key}
                            </strong>
                          ),
                        )}
                  </span>
                ))}
              </code>
            </pre>
            {recipe.result ? (
              <p className="sk-library-showcase__result">
                <span
                  className="sk-arrow-right sk-library-showcase__arrow"
                  role="img"
                  aria-label={recipe.resultLabel ?? ''}
                />
                <code className="sk-sticker sk-sticker--yellow sk-library-showcase__value">
                  {recipe.result}
                </code>
              </p>
            ) : null}
          </figure>
        ))}
      </div>
      {wordsLead ? (
        <p className="sk-library-showcase__words-lead">{wordsLead}</p>
      ) : null}
      <ul className="sk-library-showcase__words">
        {words.map((word) => (
          <li key={word.term} className="sk-library-showcase__word">
            <code
              className={`sk-sticker sk-sticker--${word.tone} sk-sticker--chip`}
            >
              {word.term}
            </code>
            {word.meaning ? <span>{word.meaning}</span> : null}
          </li>
        ))}
      </ul>
      <div className="sk-library-showcase__install">
        {install ? (
          <ol className="sk-console sk-library-showcase__console">
            <li className="sk-console-line">
              <code className="sk-console-cmd">
                <strong className="sk-console-agent">{install.tool}</strong>{' '}
                {install.args}
              </code>
              {install.note ? (
                <span className="sk-console-note">{install.note}</span>
              ) : null}
            </li>
          </ol>
        ) : null}
        {links.length > 0 ? (
          <p className="sk-library-showcase__links">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="sk-library-showcase__link"
              >
                {link.label}
              </Link>
            ))}
          </p>
        ) : null}
      </div>
    </section>
  );
}
