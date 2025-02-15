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

export function getPostsByCategory(categoryPath: string, allPosts: Post[]) {
  const categories = categoryPath.split('/');

  return allPosts.filter((p) => {
    const postCategories = p.category.split('/');
    return (
      categories.every((c) => postCategories.includes(c)) &&
      categories.length === postCategories.length
    );
  });
}
