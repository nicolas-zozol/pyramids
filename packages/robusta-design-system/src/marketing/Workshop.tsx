import type { CSSProperties } from 'react';
import { SkButton } from '../primitives/SkButton.tsx';
import { PlainLink, type SkLinkComponent } from '../primitives/SkLink.tsx';
import type { ActionLink } from './HomeHero.tsx';

/** One fact of the offer: a figure in bold, and what it covers. */
export interface WorkshopFact {
  strong?: string;
  say?: string;
  /** The sticker it is written on. */
  tone: 'yellow' | 'blue' | 'green' | 'pink';
}

export interface WorkshopProps {
  /** The section's id, `contact` when absent. */
  id?: string;
  title?: string;
  /** The tagline under the title, a line of comment in mono. */
  eyebrow?: string;
  lede?: string;
  facts?: WorkshopFact[];
  primaryCta?: ActionLink;
  secondaryCta?: ActionLink;
  /** The small print under the actions. */
  fine?: string;
  mascotSrc?: string;
  mascotAlt?: string;
  /** The speech bubble above the mascot. */
  greeting?: string;
  /** Renders the section's anchors, a router link for instance; a plain `<a>` when absent. */
  linkComponent?: SkLinkComponent;
  className?: string;
  style?: CSSProperties;
}

/**
 * The last word of a page: a card on the dotted board, the mascot greeting
 * on one side, the offer, its facts and the ways to reach out on the other.
 * The mascot sits beside the text from `lg`, above it below.
 */
export function Workshop({
  id = 'contact',
  title,
  eyebrow,
  lede,
  facts = [],
  primaryCta,
  secondaryCta,
  fine,
  mascotSrc,
  mascotAlt = '',
  greeting,
  linkComponent: Link = PlainLink,
  className,
  style,
}: WorkshopProps) {
  const merged = ['sk-workshop', 'paper-grid', className]
    .filter(Boolean)
    .join(' ');

  return (
    <section id={id} className={merged} style={style}>
      <div className="sk-box sk-sticker sk-workshop__card">
        {mascotSrc ? (
          <div className="sk-workshop__host">
            <img
              className="sk-workshop__mascot"
              src={mascotSrc}
              alt={mascotAlt}
            />
            {greeting ? (
              <span className="sk-callout sk-workshop__greeting">
                {greeting}
              </span>
            ) : null}
          </div>
        ) : null}
        <div className="sk-workshop__body">
          {title ? <h2 className="sk-workshop__title">{title}</h2> : null}
          {eyebrow ? <p className="sk-workshop__eyebrow">{eyebrow}</p> : null}
          {lede ? <p className="sk-workshop__lede">{lede}</p> : null}
          <ul className="sk-workshop__facts">
            {facts.map((fact, i) => (
              <li
                key={i}
                className={`sk-sticker sk-sticker--${fact.tone} sk-workshop__fact`}
              >
                {fact.strong ? (
                  <strong className="sk-workshop__fact-strong">
                    {fact.strong}
                  </strong>
                ) : null}
                {fact.say ? <span>{fact.say}</span> : null}
              </li>
            ))}
          </ul>
          <div className="sk-workshop__actions">
            {primaryCta ? (
              <SkButton
                variant="primary"
                href={primaryCta.href}
                linkComponent={Link}
              >
                {primaryCta.label}
              </SkButton>
            ) : null}
            {secondaryCta ? (
              <SkButton href={secondaryCta.href} linkComponent={Link}>
                {secondaryCta.label}
              </SkButton>
            ) : null}
          </div>
          {fine ? <p className="sk-workshop__fine">{fine}</p> : null}
        </div>
      </div>
    </section>
  );
}
