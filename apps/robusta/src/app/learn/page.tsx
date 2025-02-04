import { getRollContext, getSortedPostsData } from '@/logic/posts';
import type { Metadata } from 'next';
import { BlogRoll } from '@/components/blog/BlogRoll';
import { setRouterPath } from '@robusta/pyramids-helpers';
import { AppRouterPage, PAGES } from '@/app/router';

setRouterPath<AppRouterPage>(PAGES.BLOG_HOME);

// Function to dynamically generate metadata
export async function generateMetadata(): Promise<Metadata> {
  const posts = await getSortedPostsData(); // Fetch the posts data
  const numberOfPosts = posts.length;

  return {
    title: `Particular page - ${numberOfPosts} posts available`,
    description: 'A dynamic blog page showcasing the latest posts',
  };
}

export const revalidate = 300;

export default async function BlogPage() {
  const posts = await getSortedPostsData();

  const rollContext = getRollContext(posts, 1);

  return (
    <div className={'bg-base-200 py-10'}>
      <BlogRoll pageContext={rollContext} />
    </div>
  );
}
