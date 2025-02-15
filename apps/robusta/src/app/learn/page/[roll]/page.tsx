import { getRollContext, getSortedPostsData } from '@/logic/posts';
import { BlogRoll } from '@/components/blog/BlogRoll';
import type { Metadata } from 'next';
import { setRouterPath } from '@robusta/pyramids-helpers';
import { AppRouterPage, PAGES } from '@/app/router';
import { getSeoPyramidsConfig } from '@/seopyramids.config';
import { ParsedRoute } from '@/logic/routing/parse-url';

setRouterPath<AppRouterPage>(PAGES.BLOG_ROLL);

export const dynamic = 'force-static';
export const revalidate = false;

/**
 * route is /page/[roll]/page.tsx
 */
type RouteParams = {
  roll: string;
};

export async function generateStaticParams(): Promise<RouteParams[]> {
  const result: RouteParams[] = [];
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const allPosts = await getSortedPostsData(blogConfig);

  const size = blogConfig.rollSize;
  const totalPages = Math.ceil(allPosts.length / size);
  if (totalPages > 1) {
    for (let i = 2; i <= totalPages; i++) {
      result.push({ roll: i.toString() });
    }
  }
  return result;
}

/**
 * Generate dynamic metadata for each blog roll page.
 *
 * By typing params as BlogRollParams, we can safely access the roll value.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const allPosts = await getSortedPostsData(blogConfig);
  const p = await params;
  const size = blogConfig.rollSize;
  const currentPage = parseInt(p.roll, 10);
  const totalPages = Math.ceil(allPosts.length / size);

  return {
    title: `Learn - Page ${currentPage} of ${totalPages}`,
    description: `Explore posts on page ${currentPage} of ${totalPages}.`,
  };
}

/**
 * The blog roll page component.
 *
 * We now type the `params` prop using BlogRollParams to ensure
 * consistent and clear type usage.
 */
export default async function BlogRollPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const routeParams = await params;

  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const allPosts = await getSortedPostsData(blogConfig);

  const size = blogConfig.rollSize;
  const currentPage = parseInt(routeParams.roll, 10);
  const rollContext = getRollContext(allPosts, size, currentPage);

  const parsedRoute: ParsedRoute = {
    url: '/learn/page/' + currentPage,
    home: '/learn',
    type: 'BLOG_ROLL',
    isDefaultLocale: true,
    locale: 'en',
    page: currentPage,
  };

  return (
    <div className="bg-base-200 py-10">
      <BlogRoll rollContext={rollContext} route={parsedRoute} />
    </div>
  );
}
