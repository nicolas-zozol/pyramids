import type { CSSProperties } from 'react';
import { SkButton } from '../primitives/SkButton.tsx';
import { PlainLink, type SkLinkComponent } from '../primitives/SkLink.tsx';
import type { ActionLink } from './HomeHero.tsx';

/** A screenshot a door shows. */
export interface ProductShot {
  src: string;
  alt: string;
}

/** One product, behind its own door. */
export interface ProductDoor {
  /** The door's id, an anchor the page can link to. */
  id?: string;
  /** `blue` or `green`, the sticker the door is drawn on. */
  tone: 'blue' | 'green';
  /** Where and when it is used, above its name. */
  where?: string;
  name?: string;
  /** A gold tag beside the name, for a product that is not out yet. */
  soon?: string;
  say?: string;
  /** Screenshots, side by side when the door is wide enough. */
  shots?: ProductShot[];
  /** Names of steps, numbered 1 to n in the order given, three to a row. */
  steps?: string[];
  action?: ActionLink;
  /** A second way out, written as a path: `robusta.build/rooftop →`. */
  path?: ActionLink;
}

export interface ProductDoorsProps {
  /** The section's id, `products` when absent. */
  id?: string;
  title?: string;
  /** The tagline under the title, a line of comment in mono. */
  eyebrow?: string;
  doors?: ProductDoor[];
  /** Renders the section's anchors, a router link for instance; a plain `<a>` when absent. */
  linkComponent?: SkLinkComponent;
  className?: string;
  style?: CSSProperties;
}

const STEP_TONES = ['primary', 'secondary', 'accent'] as const;

/**
 * One card per product, side by side from `lg`, the first one wider: where it
 * is used, its name, what it does, and its way in.
 */
export function ProductDoors({
  id = 'products',
  title,
  eyebrow,
  doors = [],
  linkComponent: Link = PlainLink,
  className,
  style,
}: ProductDoorsProps) {
  const merged = ['sk-product-doors', className].filter(Boolean).join(' ');

  return (
    <section id={id} className={merged} style={style}>
      <div className="sk-product-doors__head">
        {title ? <h2 className="sk-product-doors__title">{title}</h2> : null}
        {eyebrow ? (
          <p className="sk-product-doors__eyebrow">{eyebrow}</p>
        ) : null}
      </div>
      <div className="sk-product-doors__list">
        {doors.map((door, i) => (
          <article
            key={door.id ?? i}
            id={door.id}
            className={`sk-box sk-sticker sk-sticker--${door.tone} sk-product-doors__door`}
          >
            {door.where ? (
              <p className="sk-product-doors__where">{door.where}</p>
            ) : null}
            {door.name ? (
              <h3 className="sk-product-doors__name">
                {door.name}
                {door.soon ? (
                  <>
                    {' '}
                    <span className="sk-tag sk-product-doors__soon">
                      {door.soon}
                    </span>
                  </>
                ) : null}
              </h3>
            ) : null}
            {door.say ? (
              <p className="sk-product-doors__say">{door.say}</p>
            ) : null}
            {door.shots && door.shots.length > 0 ? (
              <div className="sk-product-doors__shots">
                {door.shots.map((shot) => (
                  <span key={shot.src} className="sk-product-doors__shot">
                    <img
                      className="sk-product-doors__shot-img"
                      src={shot.src}
                      alt={shot.alt}
                    />
                  </span>
                ))}
              </div>
            ) : null}
            {door.steps && door.steps.length > 0 ? (
              <ol className="sk-product-doors__steps">
                {door.steps.map((step, n) => (
                  <li key={n} className="sk-product-doors__step">
                    <span
                      className={`sk-step sk-step--${STEP_TONES[n % STEP_TONES.length]} sk-product-doors__step-n`}
                      aria-hidden="true"
                    >
                      {n + 1}
                    </span>
                    <span className="sk-product-doors__step-name">{step}</span>
                  </li>
                ))}
              </ol>
            ) : null}
            {door.action || door.path ? (
              <div className="sk-product-doors__actions">
                {door.action ? (
                  <SkButton
                    variant="primary"
                    href={door.action.href}
                    linkComponent={Link}
                  >
                    {door.action.label}
                  </SkButton>
                ) : null}
                {door.path ? (
                  <Link
                    href={door.path.href}
                    className="sk-product-doors__path"
                  >
                    {door.path.label}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
