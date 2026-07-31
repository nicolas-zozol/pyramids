/**
 * The four discriminants of the v2 URL scheme. They belong to the shared base
 * and carry no site's editorial word: the content root is the site's, and it is
 * never written here.
 */
export const LOCALE_DISCRIMINANT = 'l';
export const CATEGORY_DISCRIMINANT = 'c';
export const ROLL_PAGE_DISCRIMINANT = 'p';
export const TAG_DISCRIMINANT = 't';

export const RESERVED_SEGMENTS: readonly string[] = [
  LOCALE_DISCRIMINANT,
  CATEGORY_DISCRIMINANT,
  ROLL_PAGE_DISCRIMINANT,
  TAG_DISCRIMINANT,
];

export function isReservedSegment(segment: string): boolean {
  return RESERVED_SEGMENTS.includes(segment);
}
