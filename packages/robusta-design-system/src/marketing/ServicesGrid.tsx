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
  /** Label of the card's link line. Absent or empty: no line. */
  moreLabel?: string;
  /** Absent: the label renders as text, never as an anchor. */
  moreHref?: string;
}

export interface ServicesGridProps {
  eyebrow?: string;
  title?: string;
  services?: ServiceItem[];
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_MORE_LABEL = 'see how it works';

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    title: 'the audit',
    time: '2–3 weeks · written report',
    body:
      "we read your code, your incidents, and your last 6 months of prs. you get a 30-page memo with a ranked list of risks and a plan.",
    tag: 'most popular',
    tagTone: 'pink',
    moreLabel: DEFAULT_MORE_LABEL,
  },
  {
    title: 'embedded eng',
    time: '1–2 quarters · on the team',
    body:
      "we sit inside your team — pull rotation, code review, design docs, on-call. we leave you with a smaller backlog and an upgraded bench.",
    tag: 'high stakes',
    tagTone: 'blue',
    moreLabel: DEFAULT_MORE_LABEL,
  },
  {
    title: 'rebuild surgery',
    time: '3–6 months · scoped',
    body:
      "you have one piece that's holding the rest hostage. we replace it without rewriting the world. yes, postgres still works.",
    tag: 'scoped',
    tagTone: 'green',
    moreLabel: DEFAULT_MORE_LABEL,
  },
];

interface ServiceCardProps extends ServiceItem {
  /** Alternating ±0.4° tilt, so the row of cards does not read as a grid. */
  tilt: 'left' | 'right';
}

interface MoreLineProps {
  label?: string;
  href?: string;
}

function MoreLine({ label, href }: MoreLineProps) {
  if (!label) return null;
  const content = (
    <>
      {label} <SkArrowRight width={40} />
    </>
  );
  return href ? (
    <a href={href} className="sk-services-grid__more">
      {content}
    </a>
  ) : (
    <div className="sk-services-grid__more">{content}</div>
  );
}

function ServiceCard({
  title,
  time,
  body,
  tag,
  tagTone,
  moreLabel,
  moreHref,
  tilt,
}: ServiceCardProps) {
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
          <MoreLine label={moreLabel} href={moreHref} />
        </div>
      </div>
    </div>
  );
}

/** "What we do" grid of service cards, each card closing on its own link line. */
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
