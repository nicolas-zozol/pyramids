import { Post } from '../posts';
import { getSeoPyramidsConfig } from '@/seopyramids.config';

export type Slug = string;
export type Segments = string; // without the domain !

/* Old urls with a bit of SEO traffic */
const oldUrlMap = new Map<Slug, Segments>();

export interface UrlSegments {
  locale: string | undefined;
  categories: string[] | undefined;
  slug: string;
}

export interface Segmentation {
  homeUrl: boolean;
  locale: string | undefined;
  categories: string[];
  slug: string | undefined;
  defaultLocale: boolean;
}
export interface BlogSegmentsResolver {
  resolve: (segments: string[]) => Segmentation;
}

export function cleanSegment(segment: string): string {
  return segment.trim().replace(/^\/+|\/+$/g, '');
}

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

// TODO: move this to robusta-routing
export function getPostUrl(post: Post): string {
  if (oldUrlMap.has(post.slug)) {
    return joinSegments([
      getSeoPyramidsConfig().domain,
      'blog',
      post.categoryPath,
      oldUrlMap.get(post.slug)!,
    ]);
  } else {
    return joinSegments([
      getSeoPyramidsConfig().domain,
      'blog',
      post.categoryPath,
      post.slug,
    ]);
  }
}
