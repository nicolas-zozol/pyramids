import { getRollContext, getSortedPostsData } from '@/logic/posts';
import type { Metadata } from 'next';
import { BlogRoll } from '@/components/blog/BlogRoll';
import { setRouterPath } from '@robusta/pyramids-helpers';
import { AppRouterPage, PAGES } from '@/app/router';
import { getSeoPyramidsConfig } from '@/seopyramids.config';
import { ParsedRoute } from '@/logic/routing/parse-url';

setRouterPath<AppRouterPage>(PAGES.BLOG_HOME);
export const dynamic = 'force-static';
export const revalidate = false;

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

export type RouteParams = {};

/**
 * Since there are no dynamic segments in this route (no [roll], no [slug]),
 * we can return a single element or an empty array to let Next know
 * this page should be statically generated at build time.
 */
export async function generateStaticParams(): Promise<RouteParams[]> {
  // Option A: Return an empty array indicating no dynamic params
  // return [];

  // Option B: Return [{}] if you prefer the route is recognized as static
  return [{}];
}
export default async function BlogPage() {
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const posts = await getSortedPostsData(blogConfig);

  const rollSize = blogConfig.rollSize;
  const rollContext = getRollContext(posts, rollSize, 1);
  const parsedRoute: ParsedRoute = {
    url: '/learn',
    home: '/learn',
    type: 'BLOG_ROLL',
    isDefaultLocale: true,
    locale: 'en',
    page: 1,
  };

  return (
    <div className={'bg-base-200 py-10'}>
      <BlogRoll rollContext={rollContext} route={parsedRoute} />
    </div>
  );
}
