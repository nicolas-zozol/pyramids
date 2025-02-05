import { Post } from '../posts';
import { getSeoPyramidsConfig } from '@/seopyramids.config';

export type Slug = string;
export type Segments = string; // without the domain !

/* Old urls with a bit of SEO traffic */
const oldUrlMap = new Map<Slug, Segments>();

/**
 * Joins multiple path segments into a single clean path.
 * Strips leading/trailing slashes from each segment
 * and removes empty segments.
 *
 * @param segments An array of strings representing path segments.
 * @returns A joined path with exactly one slash between segments.
 */
export function joinSegments(segments: string[]): string {
  return (
    segments
      .map((segment) => {
        // Remove surrounding whitespace
        const trimmed = segment.trim();
        // Strip leading or trailing slashes (one or more)
        return trimmed.replace(/^\/+|\/+$/g, '');
      })
      // Remove any empty segments
      .filter(Boolean)
      // Join with a single slash
      .join('/')
  );
}

export function getPostUrl(post: Post): string {
  if (oldUrlMap.has(post.slug)) {
    return joinSegments([
      getSeoPyramidsConfig().site,
      'blog',
      post.category,
      oldUrlMap.get(post.slug)!,
    ]);
  } else {
    return joinSegments([
      getSeoPyramidsConfig().site,
      'blog',
      post.category,
      post.slug,
    ]);
  }
}
