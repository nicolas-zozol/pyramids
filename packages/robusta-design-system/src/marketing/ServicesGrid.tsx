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

interface ServiceCardProps extends ServiceItem {
  /** Alternating ±0.4° tilt, so the row of cards does not read as a grid. */
  tilt: 'left' | 'right';
}

function ServiceCard({ title, time, body, tag, tagTone, tilt }: ServiceCardProps) {
  const cardClass = `sk-services-grid__card sk-services-grid__card--tilt-${tilt}`;
  return (
    <div className={cardClass}>
      {/* offset stamp behind */}
      <div className="sk-services-grid__stamp" />
      <div className="sk-services-grid__face">
        {/* wobbly border */}
        <div className="sk-services-grid__frame" />
        <div className="sk-services-grid__card-body">
          {tag ? (
            <div className="sk-services-grid__tag-row">
              <SkTag tone={tagTone}>{tag}</SkTag>
            </div>
          ) : null}
          <div className="sk-services-grid__card-title">{title}</div>
          <div className="sk-services-grid__time">{time}</div>
          <p className="sk-services-grid__body">{body}</p>
          <div className="sk-services-grid__more">
            see how it works <SkArrowRight width={40} />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * "What we do" service grid. Cards have a sticker-offset stamp + wobbly
 * SVG border, both declared in `sketch.css`.
 *
 * One column below `md`, two up to `lg`, three above — a card holding a
 * paragraph is unreadable at a third of a phone's width.
 */
export function ServicesGrid({
  eyebrow = '// what we do',
  title = 'three ways we work.',
  services = DEFAULT_SERVICES,
  className,
  style,
}: ServicesGridProps) {
  const merged = ['sk-services-grid', className].filter(Boolean).join(' ');

  return (
    <section id="work" className={merged} style={style}>
      <div className="sk-services-grid__head">
        <div className="sk-services-grid__eyebrow">{eyebrow}</div>
        <h2 className="sk-services-grid__title">{title}</h2>
      </div>
      <div className="sk-services-grid__list">
        {services.map((s, i) => (
          <ServiceCard
            key={s.title}
            {...s}
            tilt={i % 2 === 0 ? 'left' : 'right'}
          />
        ))}
      </div>
    </section>
  );
}
