import { Post } from '@/logic/posts';

const robustaCategoriesArray: string[][] = [
  ['blockchain'],
  ['blockchain', 'ethers-js'],
  ['blockchain', 'solidity'],
  ['web'],
  ['javascript'],
  ['javascript', 'typescript'],
  ['javascript', 'react'],
];

export async function getCategories(): Promise<string[][]> {
  return Promise.resolve(robustaCategoriesArray);
}

export function getPostsByCategory(categories: string[], allPosts: Post[]) {
  return allPosts.filter((p) => {
    const postCategories = p.categories;
    return (
      categories.every((c) => postCategories.includes(c)) &&
      categories.length === postCategories.length
    );
  });
}
