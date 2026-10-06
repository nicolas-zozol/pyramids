/**
 * Test support — renders a server-component tree to its host elements, with
 * `react` alone, and queries what a reader of the page receives.
 */
import { Fragment, isValidElement, type ReactNode } from 'react';

export interface HostElement {
  tag: string;
  props: Record<string, unknown>;
  children: StaticNode[];
}

export type StaticNode = HostElement | string;

type FunctionComponent = (props: Record<string, unknown>) => ReactNode;

/** The host tree a server render of `node` produces, function components called in place. */
export function renderStatic(node: ReactNode): StaticNode[] {
  if (node === null || node === undefined || typeof node === 'boolean')
    return [];
  if (typeof node === 'string' || typeof node === 'number')
    return [String(node)];
  if (Array.isArray(node))
    return node.flatMap((child: ReactNode) => renderStatic(child));
  if (!isValidElement<Record<string, unknown>>(node)) {
    throw new Error(`renderStatic cannot render ${String(node)}`);
  }
  const { type, props } = node;
  if (type === Fragment) return renderStatic(props.children as ReactNode);
  if (typeof type === 'function')
    return renderStatic((type as FunctionComponent)(props));
  if (typeof type === 'string') {
    const { children, ...attributes } = props;
    return [
      {
        tag: type,
        props: attributes,
        children: renderStatic(children as ReactNode),
      },
    ];
  }
  throw new Error(
    `renderStatic cannot render an element of type ${String(type)}`,
  );
}

/** Every host element of the tree, depth-first. */
export function hostElements(nodes: StaticNode[]): HostElement[] {
  return nodes.flatMap((node) =>
    typeof node === 'string' ? [] : [node, ...hostElements(node.children)],
  );
}

/** The host elements whose class list carries `className`. */
export function byClass(nodes: StaticNode[], className: string): HostElement[] {
  return hostElements(nodes).filter((element) =>
    String(element.props.className ?? '')
      .split(/\s+/)
      .includes(className),
  );
}

/** The host elements of one tag name. */
export function byTag(nodes: StaticNode[], tag: string): HostElement[] {
  return hostElements(nodes).filter((element) => element.tag === tag);
}

/** The value React DOM writes for the attribute, undefined when it writes none. */
export function attribute(
  element: HostElement | undefined,
  name: string,
): string | undefined {
  const value = element?.props[name];
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return undefined;
}

/** The text nodes of the tree, trimmed, the blank ones dropped. */
export function textNodes(nodes: StaticNode[]): string[] {
  return nodes.flatMap((node) =>
    typeof node === 'string'
      ? [node.trim()].filter(Boolean)
      : textNodes(node.children),
  );
}

/** What a reader receives from the tree: its text nodes, then the alt texts of its images. */
export function readableText(nodes: StaticNode[]): string[] {
  const altTexts = byTag(nodes, 'img')
    .map((image) => attribute(image, 'alt'))
    .filter((alt): alt is string => Boolean(alt));
  return [...textNodes(nodes), ...altTexts];
}
