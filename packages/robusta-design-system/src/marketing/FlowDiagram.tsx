import { Fragment, type CSSProperties, type ReactNode } from 'react';
import { SkArrowRight } from '../primitives/SkArrowRight.js';
import { SkCallout } from '../primitives/SkCallout.js';

export interface FlowStep {
  /** Step number badge. */
  n: number;
  label: string;
  /** Caption beneath the label. */
  sub: string;
}

export interface FlowDiagramProps {
  eyebrow?: string;
  /**
   * Section title. Pass a `ReactNode` to inline highlight spans (e.g.
   * `<span className="highlight-pink">five steps.</span>`). The default
   * preserves the prototype's pink-highlighted "five steps."
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

const DEFAULT_STEPS: FlowStep[] = [
  { n: 1, label: 'hello', sub: '30 min, free' },
  { n: 2, label: 'scope', sub: '1 page, written' },
  { n: 3, label: 'audit', sub: '2–3 weeks' },
  { n: 4, label: 'work', sub: 'embedded or scoped' },
  { n: 5, label: 'handoff', sub: 'docs + a memo' },
];

const DEFAULT_TITLE = (
  <>
    no surprises. just <span className="highlight-pink">five steps.</span>
  </>
);

const DEFAULT_CAVEAT = (
  <>we'll say no if your problem isn't a fit. honestly, that happens about 1 in 3 calls.</>
);

/**
 * "How an engagement runs" flow diagram on dotted-grid paper. Each step is a
 * numbered circle + label + sub.
 *
 * The connecting arrows read left-to-right, which is only true once the steps
 * fit on one row: below `lg` they wrap and `sketch.css` hides the arrows, an
 * arrow at the end of a wrapped line pointing at nothing.
 */
export function FlowDiagram({
  eyebrow = '// how an engagement runs',
  title = DEFAULT_TITLE,
  steps = DEFAULT_STEPS,
  caveat = DEFAULT_CAVEAT,
  mascotSrc = '',
  className,
  style,
}: FlowDiagramProps) {
  const merged = ['sk-flow-diagram', className].filter(Boolean).join(' ');

  return (
    <section id="approach" className={merged} style={style}>
      <div className="sk-flow-diagram__head">
        <div className="sk-flow-diagram__eyebrow">{eyebrow}</div>
        <h2 className="sk-flow-diagram__title">{title}</h2>
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
