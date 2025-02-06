import { getRollContext, getSortedPostsData } from '@/logic/posts';
import type { Metadata } from 'next';
import { BlogRoll } from '@/components/blog/BlogRoll';
import { setRouterPath } from '@robusta/pyramids-helpers';
import { AppRouterPage, PAGES } from '@/app/router';
import { getSeoPyramidsConfig } from '@/seopyramids.config';

setRouterPath<AppRouterPage>(PAGES.BLOG_HOME);

// Function to dynamically generate metadata
export async function generateMetadata(): Promise<Metadata> {
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const posts = await getSortedPostsData(blogConfig);
  const numberOfPosts = posts.length;

  return {
    title: `Page 1 - ${numberOfPosts} posts available`,
    description: 'Explore the latest posts on this page.',
  };
  // TODO: canonical URL
}

export const revalidate = 300;

export default async function BlogPage() {
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const posts = await getSortedPostsData(blogConfig);

  const rollSize = blogConfig.rollSize;
  const rollContext = getRollContext(posts, rollSize, 1);

  return (
    <div className={'bg-base-200 py-10'}>
      <BlogRoll pageContext={rollContext} />
    </div>
  );
}
