import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { SkArrowRight } from '../primitives/SkArrowRight.tsx';
import { SkCallout } from '../primitives/SkCallout.tsx';

export interface FlowStep {
  /** Step number badge. */
  n: number;
  label: string;
  /** Caption beneath the label. */
  sub: string;
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
  steps?: FlowStep[];
  /** Optional callout shown bottom-right with the thinking-tux mascot. */
  caveat?: ReactNode;
  /** Path/URL for the thinking-mascot SVG. Empty hides the mascot. */
  mascotSrc?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * "How an engagement runs" flow diagram on dotted-grid paper. Each step is a
 * numbered circle + label + sub.
 *
 * The connecting arrows read left-to-right, which is only true once the steps
 * fit on one row: below `lg` they wrap and `sketch.css` hides the arrows, an
 * arrow at the end of a wrapped line pointing at nothing.
 */
export function FlowDiagram({
  id = 'approach',
  eyebrow,
  title,
  steps = [],
  caveat,
  mascotSrc = '',
  className,
  style,
}: FlowDiagramProps) {
  const merged = ['sk-flow-diagram', className].filter(Boolean).join(' ');

  return (
    <section id={id} className={merged} style={style}>
      <div className="sk-flow-diagram__head">
        {eyebrow ? (
          <div className="sk-flow-diagram__eyebrow">{eyebrow}</div>
        ) : null}
        {title ? <h2 className="sk-flow-diagram__title">{title}</h2> : null}
      </div>
      <div className="sk-flow-diagram__steps">
        {steps.map((s, i) => (
          <Fragment key={s.n}>
            <div className="sk-flow-diagram__step">
              <span className="sk-circle sk-flow-diagram__badge">{s.n}</span>
              <div className="sk-flow-diagram__label">{s.label}</div>
              <div className="sk-flow-diagram__sub">{s.sub}</div>
            </div>
            {i < steps.length - 1 && (
              <span className="sk-flow-diagram__arrow">
                <SkArrowRight width={64} />
              </span>
            )}
          </Fragment>
        ))}
      </div>
      {caveat ? (
        <div className="sk-flow-diagram__caveat">
          {mascotSrc ? (
            <img className="sk-flow-diagram__mascot" src={mascotSrc} alt="" />
          ) : null}
          <SkCallout className="sk-flow-diagram__bubble">
            <div className="sk-flow-diagram__caveat-text">{caveat}</div>
          </SkCallout>
        </div>
      ) : null}
    </section>
  );
}
