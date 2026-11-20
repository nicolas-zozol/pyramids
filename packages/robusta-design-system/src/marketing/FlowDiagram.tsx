import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { SkCallout } from '../primitives/SkCallout.tsx';

export interface FlowStep {
  /** Step number badge. */
  n: number;
  label: string;
  /** Caption beneath the label. */
  sub: string;
}

/** One command of an example run: the agent, what it is told, what it does. */
export interface FlowExampleLine {
  agent: string;
  /** The rest of the command, after the agent's name. */
  command: string;
  /** What the agent does with it. */
  note: string;
}

/** A link closing the caveat on its own line: `lead`, then `label` linking to `href` in a new tab. */
export interface FlowLink {
  lead: string;
  label: string;
  href: string;
}

/** A run of the steps on a real case, under them. */
export interface FlowExample {
  title?: ReactNode;
  lines: FlowExampleLine[];
}

export interface FlowDiagramProps {
  /** The section's id, `approach` when absent; two diagrams on one page need two. */
  id?: string;
  eyebrow?: string;
  /**
   * Section title. Pass a `ReactNode` to inline highlight spans (e.g.
   * `<span className="highlight-pink">five steps.</span>`).
   */
  title?: ReactNode;
  /** Paragraph between the title and the steps. */
  intro?: ReactNode;
  steps?: FlowStep[];
  /** The name of the agent running every step: a frame around the row, labelled with it. Absent, no frame. */
  conductor?: string;
  /** Optional run of the steps on a real case, a card of commands under them. */
  example?: FlowExample;
  /** Optional callout shown bottom-right with the thinking-tux mascot. */
  caveat?: ReactNode;
  /** Optional link on a line of its own under the caveat, opened in a new tab. */
  caveatLink?: FlowLink;
  /** Path/URL for the thinking-mascot SVG. Empty hides the mascot. */
  mascotSrc?: string;
  className?: string;
  style?: CSSProperties;
}

const STEP_TONES = ['primary', 'secondary', 'accent'] as const;

/**
 * "How an engagement runs" flow diagram on dotted-grid paper. Each step is a
 * numbered disk on the ink stamp, purple, gold and blue in turn, then its
 * label and sub; bold marker arrows join the steps. An optional example
 * runs them on a real case under the row, in a console: one command and its
 * note per line. A conductor frames the whole row under its name.
 *
 * The connecting arrows read left-to-right, which is only true once the steps
 * fit on one row: below `lg` they wrap and `sketch.css` hides the arrows, an
 * arrow at the end of a wrapped line pointing at nothing.
 */
export function FlowDiagram({
  id = 'approach',
  eyebrow,
  title,
  intro,
  steps = [],
  conductor,
  example,
  caveat,
  caveatLink,
  mascotSrc = '',
  className,
  style,
}: FlowDiagramProps) {
  const merged = ['sk-flow-diagram', className].filter(Boolean).join(' ');

  const stepsRow = (
    <div className="sk-flow sk-flow-diagram__steps">
      {steps.map((s, i) => (
        <Fragment key={s.n}>
          <div className="sk-flow-item sk-flow-diagram__step">
            <span
              className={`sk-step sk-step--${STEP_TONES[i % STEP_TONES.length]}`}
            >
              {s.n}
            </span>
            <div className="sk-flow-diagram__label">{s.label}</div>
            <div className="sk-flow-diagram__sub">{s.sub}</div>
          </div>
          {i < steps.length - 1 && (
            <span className="sk-flow-arrow sk-flow-diagram__arrow" />
          )}
        </Fragment>
      ))}
    </div>
  );

  return (
    <section id={id} className={merged} style={style}>
      <div className="sk-flow-diagram__head">
        {eyebrow ? (
          <div className="sk-flow-diagram__eyebrow">{eyebrow}</div>
        ) : null}
        {title ? <h2 className="sk-flow-diagram__title">{title}</h2> : null}
        {intro ? <p className="sk-flow-diagram__intro">{intro}</p> : null}
      </div>
      {conductor ? (
        <div className="sk-flow-diagram__conductor">
          <span className="sk-flow-diagram__conductor-label">{conductor}</span>
          {stepsRow}
        </div>
      ) : (
        stepsRow
      )}
      {example ? (
        <figure className="sk-flow-diagram__example">
          {example.title ? (
            <figcaption className="sk-flow-diagram__example-title">
              {example.title}
            </figcaption>
          ) : null}
          <ol className="sk-console">
            {example.lines.map((line, i) => (
              <li key={i} className="sk-console-line">
                <code className="sk-console-cmd">
                  <strong className="sk-console-agent">{line.agent}</strong>{' '}
                  {line.command}
                </code>
                <span className="sk-console-note">{line.note}</span>
              </li>
            ))}
          </ol>
        </figure>
      ) : null}
      {caveat ? (
        <div className="sk-flow-diagram__caveat">
          {mascotSrc ? (
            <img className="sk-flow-diagram__mascot" src={mascotSrc} alt="" />
          ) : null}
          <SkCallout className="sk-flow-diagram__bubble">
            <div className="sk-flow-diagram__caveat-text">
              {caveat}
              {caveatLink ? (
                <>
                  <br />
                  {caveatLink.lead}{' '}
                  <a
                    className="sk-flow-diagram__caveat-link"
                    href={caveatLink.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {caveatLink.label}
                  </a>
                </>
              ) : null}
            </div>
          </SkCallout>
        </div>
      ) : null}
    </section>
  );
}
