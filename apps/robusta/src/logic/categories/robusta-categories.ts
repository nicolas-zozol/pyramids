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
