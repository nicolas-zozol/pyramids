import type { CSSProperties } from 'react';
import { SkArrowRight } from '../primitives/SkArrowRight.tsx';
import { PlainLink, type SkLinkComponent } from '../primitives/SkLink.tsx';
import { SkTag, type SkTagTone } from '../primitives/SkTag.tsx';

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
  /** Renders the surface's anchors, a router link for instance; a plain `<a>` when absent. */
  linkComponent?: SkLinkComponent;
  className?: string;
  style?: CSSProperties;
}

interface ServiceCardProps extends ServiceItem {
  /** Alternating ±0.4° tilt, so the row of cards does not read as a grid. */
  tilt: 'left' | 'right';
  linkComponent: SkLinkComponent;
}

interface MoreLineProps {
  label?: string;
  href?: string;
  linkComponent: SkLinkComponent;
}

function MoreLine({ label, href, linkComponent: Link }: MoreLineProps) {
  if (!label) return null;
  const content = (
    <>
      {label} <SkArrowRight width={40} />
    </>
  );
  return href ? (
    <Link href={href} className="sk-services-grid__more">
      {content}
    </Link>
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
  linkComponent,
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
          <MoreLine
            label={moreLabel}
            href={moreHref}
            linkComponent={linkComponent}
          />
        </div>
      </div>
    </div>
  );
}

/** "What we do" grid of service cards, each card closing on its own link line. */
export function ServicesGrid({
  eyebrow,
  title,
  services = [],
  linkComponent = PlainLink,
  className,
  style,
}: ServicesGridProps) {
  const merged = ['sk-services-grid', className].filter(Boolean).join(' ');

  return (
    <section id="work" className={merged} style={style}>
      <div className="sk-services-grid__head">
        {eyebrow ? (
          <div className="sk-services-grid__eyebrow">{eyebrow}</div>
        ) : null}
        {title ? <h2 className="sk-services-grid__title">{title}</h2> : null}
      </div>
      <div className="sk-services-grid__list">
        {services.map((s, i) => (
          <ServiceCard
            key={s.title}
            {...s}
            tilt={i % 2 === 0 ? 'left' : 'right'}
            linkComponent={linkComponent}
          />
        ))}
      </div>
    </section>
  );
}
