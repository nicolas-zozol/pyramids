import { getSortedPostsData, RollContext } from '@/logic/posts';
import {
  BlogSearchParams,
  getCurrentBlogPage,
} from '@/logic/routing/pagination';
import { getSeoPyramidsConfig } from '@/seopyramids.config';

export async function fetchRollContext(
  searchParams: BlogSearchParams | undefined,
): Promise<RollContext> {
  // currentPage starts at 1
  const currentPage = getCurrentBlogPage(searchParams);
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const posts = await getSortedPostsData(blogConfig);

  const numberOfPages = Math.ceil(posts.length / blogConfig.rollSize);
  const roll = posts.slice(
    (currentPage - 1) * blogConfig.rollSize,
    currentPage * blogConfig.rollSize,
  );

  return {
    currentPage,
    numberOfPages,
    rollSize: blogConfig.rollSize,
    roll,
  };
}
