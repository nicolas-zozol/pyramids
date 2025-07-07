import { getRollContext, getSortedPostsData } from '@/logic/posts';
import { BlogRoll } from '@/components/blog/BlogRoll';
import type { Metadata } from 'next';
import { setRouterPath } from '@robusta/pyramids-helpers';
import { AppRouterPage, PAGES } from '@/app/router';
import { getSeoPyramidsConfig } from '@/seopyramids.config';
import { ParsedRoute } from '@/logic/routing/parse-url';
import { TagRoll, TagRollContext } from '@/components/blog/tag/TagRoll';
import { getPostsByTag } from '@/logic/tags';

setRouterPath<AppRouterPage>(PAGES.BLOG_ROLL);

export const dynamic = 'force-static';
export const revalidate = false;

/**
 * route is /tag/[tag]
 */
type RouteParams = {
  tag: string;
  roll: string;
};

// e.g. /learn/tag/[tag]/page/[roll]
export async function generateStaticParams(): Promise<RouteParams[]> {
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const allPosts = await getSortedPostsData(blogConfig);
  const rollSize = blogConfig.rollSize;

  // 1. Group posts by tag so we can figure out how many pages each tag needs
  const postsByTag: Record<string, number> = {};

  for (const post of allPosts) {
    for (const t of post.tags) {
      if (!postsByTag[t]) {
        postsByTag[t] = 0;
      }
      postsByTag[t]++;
    }
  }

  const result: RouteParams[] = [];

  // 2. For each tag, figure out how many pages are needed
  for (const [tag, count] of Object.entries(postsByTag)) {
    const numberOfPages = Math.ceil(count / rollSize);
    // We often consider page=1 in /learn/tag/[tag], so we only generate pages 2..n here
    for (let pageNum = 2; pageNum <= numberOfPages; pageNum++) {
      result.push({ tag, roll: pageNum.toString() });
    }
  }

  console.log('>>> ', result);

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
  const { tag, roll } = await params;
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const allPosts = await getSortedPostsData(blogConfig);
  const posts = getPostsByTag(tag, allPosts);

  const currentPage = parseInt(roll, 10);
  const size = blogConfig.rollSize;
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
  const { tag, roll } = await params;

  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const allPosts = await getSortedPostsData(blogConfig);
  const posts = getPostsByTag(tag, allPosts);

  const size = blogConfig.rollSize;
  const currentPage = parseInt(roll, 10);

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
