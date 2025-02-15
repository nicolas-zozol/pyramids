import { getRollContext, getSortedPostsData } from '@/logic/posts';
import { BlogRoll } from '@/components/blog/BlogRoll';
import type { Metadata } from 'next';
import { setRouterPath } from '@robusta/pyramids-helpers';
import { AppRouterPage, PAGES } from '@/app/router';
import { getSeoPyramidsConfig } from '@/seopyramids.config';
import { ParsedRoute } from '@/logic/routing/parse-url';
import { TagRoll, TagRollContext } from '@/components/blog/tag/TagRoll';
import { getAllTags, getPostsByTag } from '@/logic/tags';

setRouterPath<AppRouterPage>(PAGES.BLOG_ROLL);

export const dynamic = 'force-static';
export const revalidate = false;

/**
 * route is /tag/[tag]
 */
type RouteParams = {
  tag: string;
};

// generateStaticParams for /learn/tag/[tag]
export async function generateStaticParams(): Promise<RouteParams[]> {
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const allPosts = await getSortedPostsData(blogConfig);
  return getAllTags(allPosts).map((tag) => ({ tag }));
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
  const p = await params;
  const { tag } = p;
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const allPosts = await getSortedPostsData(blogConfig);
  const posts = getPostsByTag(tag, allPosts);

  console.log('metadata: route params', p);
  const size = blogConfig.rollSize;
  const currentPage = 1;
  const totalPages = Math.ceil(posts.length / size);

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
export default async function TagRollPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const p = await params;
  const { tag } = p;
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const allPosts = await getSortedPostsData(blogConfig);
  const posts = getPostsByTag(tag, allPosts);

  const size = blogConfig.rollSize;

  const currentPage = 1;

  const rollContext: TagRollContext = {
    ...getRollContext(posts, size, currentPage),
    tag,
  };

  const parsedRoute: ParsedRoute = {
    url: '/learn/tag/' + tag,
    home: '/learn',
    type: 'BLOG_ROLL',
    isDefaultLocale: true,
    locale: 'en',
    page: currentPage,
  };

  return (
    <div className="bg-base-200 py-10">
      <TagRoll rollContext={rollContext} route={parsedRoute} />
    </div>
  );
}
