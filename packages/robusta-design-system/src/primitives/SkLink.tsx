import type { AnchorHTMLAttributes, ComponentType } from 'react';

/** What a surface hands its link component: the attributes of an anchor, `href` required. */
export type SkLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
};

/** The component a site supplies to render the anchors of the surfaces, a router link for instance. */
export type SkLinkComponent = ComponentType<SkLinkProps>;

/** The anchor a surface renders when its site supplies no link component. */
export function PlainLink(props: SkLinkProps) {
  return <a {...props} />;
}
