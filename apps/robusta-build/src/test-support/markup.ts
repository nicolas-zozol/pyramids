/** Test support — queries on the markup a server render writes, read as a string. */

/** `text` as React DOM escapes it in a text node or an attribute. */
export function htmlText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/** The opening tags of the anchors whose href is exactly `href`. */
export function anchorsTo(html: string, href: string): string[] {
  return [...html.matchAll(/<a\b[^>]*>/g)]
    .map(([tag]) => tag)
    .filter((tag) => tag.includes(` href="${htmlText(href)}"`));
}

/** The href of every anchor of the markup, in document order. */
export function hrefs(html: string): string[] {
  return [...html.matchAll(/<a\b[^>]*\shref="([^"]*)"/g)].map(
    ([, href]) => href,
  );
}

/** Every class name of the markup, deduplicated. */
export function classNames(html: string): string[] {
  const names = [...html.matchAll(/\sclass="([^"]*)"/g)].flatMap(([, list]) =>
    list.split(/\s+/).filter(Boolean),
  );
  return [...new Set(names)];
}

/** What a reader receives: the text nodes, then the non-empty alt, placeholder, aria-label and title, unescaped HTML left as written. */
export function readableTexts(html: string): string[] {
  const texts = [...html.matchAll(/>([^<]+)</g)]
    .map(([, text]) => text.trim())
    .filter(Boolean);
  const attributes = [
    ...html.matchAll(/\s(?:alt|placeholder|aria-label|title)="([^"]+)"/g),
  ].map(([, text]) => text);
  return [...texts, ...attributes];
}
