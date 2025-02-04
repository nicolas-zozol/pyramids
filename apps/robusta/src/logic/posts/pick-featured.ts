import { Post } from '@/logic/posts';

export function pickFeatured(posts: Post[]): Post[] {
  return posts.filter((p) => p.featured).slice(0, 3);
}
