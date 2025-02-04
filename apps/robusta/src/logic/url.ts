import { Post } from './posts';
import { seoPyramidsConfig } from '@/seopyramids.config';

export type Slug = string;
export type Url = string; // without the domain !

/* Old urls with a bit of SEO traffic */
const oldUrlMap = new Map<Slug, Url>();

export function path(paths: string[]) {
  return paths
    .map((p) => (p.charAt(0) === '/' ? p.slice(1) : p))
    .map((p) => (p.charAt(p.length - 1) === '/' ? p.slice(0, p.length - 1) : p))
    .join('/');
}

export function getPostUrl(post: Post): string {
  if (oldUrlMap.has(post.slug)) {
    return path([
      seoPyramidsConfig.site,
      'blog',
      post.category,
      oldUrlMap.get(post.slug)!,
    ]);
  } else {
    return path([seoPyramidsConfig.site, 'blog', post.category, post.slug]);
  }
}
