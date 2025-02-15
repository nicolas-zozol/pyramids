import { Post } from './posts';

export type Tag = string;

const silentTags = [
  'es2015', // too old
  'tech', // too mainstream, not the target
];

export function getAllTags(allPosts: Post[]) {
  const tagsSet = new Set<string>();
  for (const post of allPosts) {
    for (const t of post.tags) {
      tagsSet.add(t);
    }
  }
  return Array.from(tagsSet);
}

// TODO: cache this
export function getValuableTags(posts: Post[]) {
  const map = new Map<Tag, number>();
  posts.forEach((post) => {
    post.tags.forEach((t) => {
      const count = map.get(t);
      if (map.get(t)) {
        map.set(t, count! + 1);
      } else {
        map.set(t, 1);
      }
    });
  }, []);

  return Array.from(map.keys())
    .filter((t) => map.get(t)! >= 2)
    .filter((t) => !silentTags.includes(t));
}

export function getPostsByTag(tag: Tag, allPosts: Post[]) {
  return allPosts.filter((p) => p.tags.includes(tag));
}
