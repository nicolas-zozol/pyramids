import { Post } from './posts';

export type Tag = string;

const silentTags = [
  'es2015', // too old
  'tech', // too mainstream, not the target
];

export function getAllTags(posts: Post[]) {
  return posts.reduce((tags: Tag[], post) => {
    post.tags.forEach((t) => {
      if (!tags.includes(t)) {
        tags.push(t);
      }
    });
    return tags;
  }, []);
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

export function getPostsByCategory(categoryPath: string, allPosts: Post[]) {
  const categories = categoryPath.split('/');

  return allPosts.filter((p) => {
    const postCategories = p.category.split('/');
    return categories.some((c) => postCategories.includes(c));
  });
}
