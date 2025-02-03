import { getSortedPostsData } from '@/logic/posts';
import { configuration } from '@/logic/configuration';
import { BlogRoll } from '@/components/blog/blog-roll';
import type { Metadata } from 'next';
import { setRouterPath } from '@robusta/pyramids-helpers';
import { AppRouterPage, PAGES } from '@/app/router';

setRouterPath<AppRouterPage>(PAGES.BLOG_ROLL);

// Revalidation time for incremental static regeneration
export const revalidate = 300;

/**
 * Define the type for our dynamic route parameters.
 * This ensures consistency between the functions that use them.
 */
export type BlogRollParams = {
  roll: string;
};

/**
 * Generate all dynamic paths for the blog roll.
 *
 * We return an array of objects of type BlogRollParams.
 * For example: [ { roll: "1" }, { roll: "2" }, ... ]
 */
export async function generateStaticParams(): Promise<BlogRollParams[]> {
  const allPosts = await getSortedPostsData();
  const size = configuration.rollSize;
  const numberOfPages = Math.ceil(allPosts.length / size);

  const paths: BlogRollParams[] = [];
  for (let i = 1; i <= numberOfPages; i++) {
    paths.push({ roll: `${i}` });
  }

  return paths;
}

/**
 * Generate dynamic metadata for each blog roll page.
 *
 * By typing params as BlogRollParams, we can safely access the roll value.
 */
export async function generateMetadata({
  params,
}: {
  params: BlogRollParams;
}): Promise<Metadata> {
  const allPosts = await getSortedPostsData();
  const size = configuration.rollSize;
  const currentPage = parseInt(params.roll, 10);
  const totalPages = Math.ceil(allPosts.length / size);

  return {
    title: `Blog - Page ${currentPage} of ${totalPages}`,
    description: `Explore blog posts on page ${currentPage} of ${totalPages}.`,
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
  params: BlogRollParams;
}) {
  const allPosts = await getSortedPostsData();
  const size = configuration.rollSize;

  const currentPage = parseInt(params.roll, 10);
  const start = size * (currentPage - 1);
  const end = start + size;

  const rollContext = {
    currentPage,
    rollSize: size,
    numberOfPages: Math.ceil(allPosts.length / size),
    roll: allPosts.slice(start, end),
  };

  return (
    <div className="bg-base-200 py-10">
      <BlogRoll pageContext={rollContext} />
    </div>
  );
}
