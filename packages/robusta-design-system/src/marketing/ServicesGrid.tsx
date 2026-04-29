import type { CSSProperties } from 'react';
import { SkArrowRight } from '../primitives/SkArrowRight.js';
import { SkTag, type SkTagTone } from '../primitives/SkTag.js';

export interface ServiceItem {
  title: string;
  /** e.g. "2–3 weeks · written report" */
  time: string;
  /** Body copy. */
  body: string;
  /** Tag label rendered top-right of the card. */
  tag?: string;
  /** Tag tone — controls the colored frame on the tag. */
  tagTone?: SkTagTone;
}

export interface ServicesGridProps {
  eyebrow?: string;
  title?: string;
  services?: ServiceItem[];
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    title: 'the audit',
    time: '2–3 weeks · written report',
    body:
      "we read your code, your incidents, and your last 6 months of prs. you get a 30-page memo with a ranked list of risks and a plan.",
    tag: 'most popular',
    tagTone: 'pink',
  },
  {
    title: 'embedded eng',
    time: '1–2 quarters · on the team',
    body:
      "we sit inside your team — pull rotation, code review, design docs, on-call. we leave you with a smaller backlog and an upgraded bench.",
    tag: 'high stakes',
    tagTone: 'blue',
  },
  {
    title: 'rebuild surgery',
    time: '3–6 months · scoped',
    body:
      "you have one piece that's holding the rest hostage. we replace it without rewriting the world. yes, postgres still works.",
    tag: 'scoped',
    tagTone: 'green',
  },
];

const sansBlock: CSSProperties = { fontFamily: 'var(--font-sans)' };

const WOBBLY_BORDER_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200' preserveAspectRatio='none'><path d='M3,4 Q40,2 100,3 T197,5 Q198,60 197,120 Q198,170 196,196 Q140,198 100,196 T6,196 Q3,140 4,80 T3,4 Z' fill='none' stroke='%231a1a1a' stroke-width='0.7'/></svg>\")";

interface ServiceCardProps extends ServiceItem {
  rotate: string;
}

function ServiceCard({ title, time, body, tag, tagTone, rotate }: ServiceCardProps) {
  return (
    <div style={{ position: 'relative', transform: `rotate(${rotate})` }}>
      {/* offset stamp behind */}
      <div
        style={{
          position: 'absolute',
          inset: '6px -6px -6px 6px',
          background: 'var(--ink)',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'var(--paper)',
          padding: '24px 26px 28px',
          minHeight: 220,
        }}
      >
        {/* wobbly border */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage: WOBBLY_BORDER_SVG,
            backgroundSize: '100% 100%',
          }}
        />
        <div style={{ position: 'relative', zIndex: 2 }}>
          {tag ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
              <SkTag tone={tagTone}>{tag}</SkTag>
            </div>
          ) : null}
          <div style={{ ...sansBlock, fontSize: 38, lineHeight: 1.1, marginBottom: 4, color: 'var(--ink)' }}>
            {title}
          </div>
          <div style={{ ...sansBlock, fontSize: 14, color: 'var(--ink-mute)', marginBottom: 14 }}>
            {time}
          </div>
          <p style={{ ...sansBlock, fontSize: 17, lineHeight: 1.45, color: 'var(--ink-soft)', margin: 0 }}>
            {body}
          </p>
          <div
            style={{
              marginTop: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              ...sansBlock,
              fontSize: 15,
              color: 'var(--ink)',
            }}
          >
            see how it works <SkArrowRight width={40} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Three-column "what we do" service grid. Cards have a sticker-offset stamp
 * + wobbly inline-SVG border. Per-card rotation alternates ±0.4° to fight
 * the perfect grid feel.
 */
export function ServicesGrid({
  eyebrow = '// what we do',
  title = 'three ways we work.',
  services = DEFAULT_SERVICES,
  className,
  style,
}: ServicesGridProps) {
  return (
    <section
      id="work"
      className={className}
      style={{ padding: '64px 48px', ...style }}
    >
      <div style={{ marginBottom: 36 }}>
        <div style={{ ...sansBlock, fontSize: 15, color: 'var(--ink-mute)', marginBottom: 6 }}>
          {eyebrow}
        </div>
        <h2 style={{ ...sansBlock, fontSize: 56, margin: 0, lineHeight: 1, color: 'var(--ink)' }}>
          {title}
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28 }}>
        {services.map((s, i) => (
          <ServiceCard
            key={s.title}
            {...s}
            rotate={i % 2 === 0 ? '-0.4deg' : '0.4deg'}
          />
        ))}
      </div>
    </section>
  );
}
