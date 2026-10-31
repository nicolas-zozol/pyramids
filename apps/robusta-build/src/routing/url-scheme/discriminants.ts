/**
 * The three discriminants of the v2 URL scheme. They belong to the shared base
 * and carry no site's editorial word: the content root is the site's, and it is
 * never written here. A Locale needs none: it is always the first segment.
 */
export const CATEGORY_DISCRIMINANT = 'c';
export const ROLL_PAGE_DISCRIMINANT = 'p';
export const TAG_DISCRIMINANT = 't';

export const RESERVED_SEGMENTS: readonly string[] = [
  CATEGORY_DISCRIMINANT,
  ROLL_PAGE_DISCRIMINANT,
  TAG_DISCRIMINANT,
];

/** True for a segment the scheme reserves, which no slug or category may take. */
export function isReservedSegment(segment: string): boolean {
  return RESERVED_SEGMENTS.includes(segment);
}
