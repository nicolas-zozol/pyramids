import type { CSSProperties } from 'react';
import { SkButton } from '../primitives/SkButton.tsx';
import { PlainLink, type SkLinkComponent } from '../primitives/SkLink.tsx';

/** A link of a section: its text and where it goes. */
export interface ActionLink {
  label: string;
  href: string;
}

/** A run of a paragraph: plain text, or a name set in bold. */
export type TextRun = string | { strong: string };

/** One floor of the building: the roof, a floor or the ground it stands on. */
export interface HomeFloor {
  /** `roof`: the top, on blue; `floor`: on green; `ground`: plain, and never a link. */
  level: 'roof' | 'floor' | 'ground';
  name?: string;
  /** What it is, on the right of its name. */
  kind?: string;
  say?: string;
  /** The floor's destination; the whole card is the link. Ignored on the ground. */
  href?: string;
  /** The destination written as a path at the foot of the card, `robusta.build/rooftop →`. */
  pathLabel?: string;
}

export interface HomeHeroProps {
  /** The section's id, `top` when absent. */
  id?: string;
  title?: string;
  /** The tagline under the title, a line of comment in mono. */
  eyebrow?: string;
  /** The paragraphs under the title, each one a list of runs. */
  lede?: TextRun[][];
  primaryCta?: ActionLink;
  secondaryCta?: ActionLink;
  mascotSrc?: string;
  mascotAlt?: string;
  /** The note beside the mascot, on the roof. */
  annotation?: string;
  /** A picture standing on the roof on two posts, framed in ink; it takes the mascot's place. */
  billboardSrc?: string;
  billboardAlt?: string;
  /** The building, top down: roof first, ground last. */
  floors?: HomeFloor[];
  /** Renders the section's anchors, a router link for instance; a plain `<a>` when absent. */
  linkComponent?: SkLinkComponent;
  className?: string;
  style?: CSSProperties;
}

const TONE: Record<HomeFloor['level'], string> = {
  roof: 'sk-sticker sk-sticker--blue sk-home-hero__floor sk-home-hero__floor--roof',
  floor: 'sk-sticker sk-sticker--green sk-home-hero__floor',
  ground: 'sk-home-hero__floor',
};

/**
 * The top of the home page: the promise and its two actions on one side, and
 * on the other a building, one floor per product, the mascot on its roof and
 * the visitor's repository as its ground. One column below `lg`.
 */
export function HomeHero({
  id = 'top',
  title,
  eyebrow,
  lede = [],
  primaryCta,
  secondaryCta,
  mascotSrc,
  mascotAlt = '',
  annotation,
  billboardSrc,
  billboardAlt = '',
  floors = [],
  linkComponent: Link = PlainLink,
  className,
  style,
}: HomeHeroProps) {
  const merged = ['sk-home-hero', className].filter(Boolean).join(' ');

  return (
    <section id={id} className={merged} style={style}>
      <div className="sk-home-hero__copy">
        {title ? <h1 className="sk-home-hero__title">{title}</h1> : null}
        {eyebrow ? <p className="sk-home-hero__eyebrow">{eyebrow}</p> : null}
        {lede.length > 0 ? (
          <div className="sk-home-hero__ledes">
            {lede.map((paragraph, p) => (
              <p key={p} className="sk-home-hero__lede">
                {paragraph.map((run, i) =>
                  typeof run === 'string' ? (
                    run
                  ) : (
                    <strong key={i} className="sk-home-hero__strong">
                      {run.strong}
                    </strong>
                  ),
                )}
              </p>
            ))}
          </div>
        ) : null}
        <div className="sk-home-hero__actions">
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
      </div>
      <div className="sk-home-hero__building">
        {billboardSrc ? (
          <div className="sk-home-hero__board">
            <div className="sk-home-hero__billboard">
              <img
                className="sk-home-hero__billboard-img"
                src={billboardSrc}
                alt={billboardAlt}
              />
              <span
                className="sk-home-hero__post sk-home-hero__post--left"
                aria-hidden="true"
              />
              <span
                className="sk-home-hero__post sk-home-hero__post--right"
                aria-hidden="true"
              />
            </div>
          </div>
        ) : mascotSrc ? (
          <div className="sk-home-hero__roofline">
            {annotation ? (
              <p className="sk-home-hero__note">{annotation}</p>
            ) : null}
            <img
              className="sk-home-hero__mascot"
              src={mascotSrc}
              alt={mascotAlt}
            />
          </div>
        ) : null}
        {floors.map((floor, i) => {
          const body = (
            <>
              <span className="sk-home-hero__floor-top">
                {floor.name ? (
                  <span
                    className={
                      floor.level === 'ground'
                        ? 'sk-home-hero__ground-name'
                        : 'sk-home-hero__floor-name'
                    }
                  >
                    {floor.name}
                  </span>
                ) : null}
                {floor.kind ? (
                  <span className="sk-home-hero__floor-kind">{floor.kind}</span>
                ) : null}
              </span>
              {floor.say ? (
                <span className="sk-home-hero__floor-say">{floor.say}</span>
              ) : null}
              {floor.pathLabel && floor.level !== 'ground' ? (
                <span className="sk-home-hero__floor-go">
                  {floor.pathLabel}
                </span>
              ) : null}
            </>
          );
          const boxClass = `sk-box ${TONE[floor.level]}`;
          return floor.href && floor.level !== 'ground' ? (
            <Link key={i} href={floor.href} className={boxClass}>
              {body}
            </Link>
          ) : (
            <div key={i} className={boxClass}>
              {body}
            </div>
          );
        })}
        <span className="sk-divider" aria-hidden="true" />
      </div>
    </section>
  );
}
