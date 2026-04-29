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

const sansBlock: CSSProperties = { fontFamily: 'var(--font-sans)' };

/**
 * "How an engagement runs" left-to-right flow diagram on dotted-grid paper.
 * Each step is a numbered circle + label + sub. Arrows separate them.
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
  return (
    <section
      id="approach"
      className={className}
      style={{
        padding: '64px 48px',
        background: 'var(--paper)',
        backgroundImage:
          'radial-gradient(var(--ink-faint) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        backgroundPosition: '11px 11px',
        borderTop: '1.5px dashed var(--ink-faint)',
        borderBottom: '1.5px dashed var(--ink-faint)',
        ...style,
      }}
    >
      <div style={{ marginBottom: 40 }}>
        <div style={{ ...sansBlock, fontSize: 15, color: 'var(--ink-mute)', marginBottom: 6 }}>
          {eyebrow}
        </div>
        <h2 style={{ ...sansBlock, fontSize: 56, margin: 0, lineHeight: 1, color: 'var(--ink)' }}>
          {title}
        </h2>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          flexWrap: 'wrap',
        }}
      >
        {steps.map((s, i) => (
          <Fragment key={s.n}>
            <div style={{ textAlign: 'center', minWidth: 110 }}>
              <span
                className="sk-circle"
                style={{ width: 72, height: 72, fontSize: 32, ...sansBlock }}
              >
                {s.n}
              </span>
              <div style={{ ...sansBlock, fontSize: 28, marginTop: 8, lineHeight: 1, color: 'var(--ink)' }}>
                {s.label}
              </div>
              <div style={{ ...sansBlock, fontSize: 13, color: 'var(--ink-mute)', marginTop: 4 }}>
                {s.sub}
              </div>
            </div>
            {i < steps.length - 1 && <SkArrowRight width={64} />}
          </Fragment>
        ))}
      </div>
      {caveat ? (
        <div
          style={{
            marginTop: 36,
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 16,
          }}
        >
          {mascotSrc ? (
            <img src={mascotSrc} alt="" style={{ height: 110 }} />
          ) : null}
          <SkCallout style={{ maxWidth: 320 }}>
            <div style={{ ...sansBlock, fontSize: 15 }}>{caveat}</div>
          </SkCallout>
        </div>
      ) : null}
    </section>
  );
}
