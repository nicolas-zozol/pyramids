import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react';
import { PlainLink, type SkLinkComponent } from './SkLink.js';

type SkButtonBase = {
  /** Visual variant — maps to `.sk-btn--primary` / `.sk-btn--ghost` */
  variant?: 'primary' | 'ghost' | 'default';
  children: ReactNode;
};

type SkButtonAsButton = SkButtonBase &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
    href?: never;
    linkComponent?: never;
  };

type SkButtonAsAnchor = SkButtonBase &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children'> & {
    href: string;
    /** Renders the anchor, a router link for instance; a plain `<a>` when absent. */
    linkComponent?: SkLinkComponent;
  };

/**
 * A union rather than one widened interface, so the rest props are checked
 * against the element that actually gets rendered: anchor attributes on the
 * anchor branch, button attributes on the button branch.
 *
 * Note this is a type alias and not an `interface`, which the union forces:
 * `interface X extends SkButtonProps` is not legal against it.
 */
export type SkButtonProps = SkButtonAsButton | SkButtonAsAnchor;

function skButtonClass(
  variant: SkButtonBase['variant'],
  className: string | undefined,
): string {
  const variantClass =
    variant === 'primary'
      ? 'sk-btn--primary'
      : variant === 'ghost'
        ? 'sk-btn--ghost'
        : '';
  return ['sk-btn', variantClass, className].filter(Boolean).join(' ');
}

/**
 * Hand-drawn sketchnote button. Pure presentational wrapper over the
 * `.sk-btn` family of CSS classes shipped in `sketch.css`.
 *
 * Given an `href` it renders an anchor, through `linkComponent` when one is
 * given, and given none the button it has always rendered. `.sk-btn` already declares `display: inline-flex` and
 * `text-decoration: none`, so the two branches look alike and the class list
 * is computed identically for both.
 *
 * Server-component-safe by default. If you need an `onClick`, wrap this
 * in a client component on the consumer side.
 */
export function SkButton(props: SkButtonProps) {
  if (props.href !== undefined) {
    const {
      variant,
      className,
      children,
      linkComponent: Link = PlainLink,
      ...rest
    } = props as SkButtonAsAnchor;
    return (
      <Link className={skButtonClass(variant, className)} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant, className, children, ...rest } = props as Omit<
    SkButtonAsButton,
    'href' | 'linkComponent'
  >;
  return (
    <button className={skButtonClass(variant, className)} {...rest}>
      {children}
    </button>
  );
}
