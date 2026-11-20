import type { CSSProperties } from 'react';
import { SkButton } from '../primitives/SkButton.tsx';
import { PlainLink, type SkLinkComponent } from '../primitives/SkLink.tsx';
import type { ActionLink } from './HomeHero.tsx';

/** One item of the cascade: a document and the agent that writes it, the reader's gate, or a command typed at the terminal. */
export type CascadeItem =
  | { kind: 'sheet'; name?: string; who?: string }
  | { kind: 'gate'; label?: string; say?: string }
  | { kind: 'command'; agent: string };

export interface ProductHeroProps {
  /** The section's id, `top` when absent. */
  id?: string;
  /** The line above the title: the product and what it is. */
  kicker?: string;
  title?: string;
  lede?: string;
  primaryCta?: ActionLink;
  secondaryCta?: ActionLink;
  /** The small print under the actions, a license for instance. */
  note?: string;
  /** The documents in the order they are written, top down; a sheet and a command are numbered in that order. */
  cascade?: CascadeItem[];
  /** The accessible name of the cascade. */
  cascadeLabel?: string;
  /** Renders the section's anchors, a router link for instance; a plain `<a>` when absent. */
  linkComponent?: SkLinkComponent;
  className?: string;
  style?: CSSProperties;
}

const STEP_TONES = ['primary', 'secondary', 'accent'] as const;

/**
 * The top of a product's page: what the product is and its ways in on one
 * side, and on the other the documents it writes, down a stair, the reader's
 * gate before the code. One column below `lg`, where the stair flattens.
 */
export function ProductHero({
  id = 'top',
  kicker,
  title,
  lede,
  primaryCta,
  secondaryCta,
  note,
  cascade = [],
  cascadeLabel,
  linkComponent: Link = PlainLink,
  className,
  style,
}: ProductHeroProps) {
  const merged = ['sk-product-hero', className].filter(Boolean).join(' ');
  let n = 0;
  let depth = -1;

  return (
    <section id={id} className={merged} style={style}>
      <div className="sk-product-hero__copy">
        {kicker ? (
          <p className="sk-product-hero__kicker">
            <span
              className="sk-arrow-right sk-product-hero__arrow"
              aria-hidden="true"
            />
            {kicker}
          </p>
        ) : null}
        {title ? <h1 className="sk-product-hero__title">{title}</h1> : null}
        {lede ? <p className="sk-product-hero__lede">{lede}</p> : null}
        <div className="sk-product-hero__actions">
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
        {note ? <p className="sk-product-hero__note">{note}</p> : null}
      </div>
      <ol
        className="sk-product-hero__cascade"
        aria-label={cascadeLabel || undefined}
      >
        {cascade.map((item, i) => {
          // a command stays on the step of the gate above it: the stair moves one step per document
          if (item.kind !== 'command') depth += 1;
          const stair = { '--sk-depth': Math.max(depth, 0) } as CSSProperties;
          if (item.kind === 'gate')
            return (
              <li key={i} className="sk-product-hero__gate" style={stair}>
                {item.label ? (
                  <span className="sk-sticker sk-sticker--secondary sk-sticker--chip">
                    {item.label}
                  </span>
                ) : null}
                {item.say ? <span>{item.say}</span> : null}
              </li>
            );
          n += 1;
          if (item.kind === 'command')
            return (
              <li key={i} className="sk-product-hero__code" style={stair}>
                <ol className="sk-console sk-product-hero__console">
                  <li className="sk-console-line sk-product-hero__console-line">
                    <code className="sk-console-cmd">
                      <strong className="sk-console-agent">{item.agent}</strong>
                    </code>
                  </li>
                </ol>
              </li>
            );
          return (
            <li key={i} className="sk-box sk-product-hero__sheet" style={stair}>
              <span
                className={`sk-step sk-step--${STEP_TONES[(n - 1) % STEP_TONES.length]} sk-product-hero__step`}
                aria-hidden="true"
              >
                {n}
              </span>
              {item.name ? (
                <span className="sk-product-hero__sheet-name">{item.name}</span>
              ) : null}
              {item.who ? (
                <span className="sk-product-hero__sheet-who">{item.who}</span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
