import { getSortedPostsData } from '@/logic/posts';
import { configuration } from '@/logic/configuration';
import { BlogRoll } from '@/components/blog/blog-roll';
import type { Metadata } from 'next';
import { setRouterPath } from '@robusta/pyramids-helpers';
import { AppRouterPage, PAGES } from '@/app/router';

setRouterPath<AppRouterPage>(PAGES.BLOG_ROLL);
// Revalidation time for incremental static regeneration
export const revalidate = 300;

// Function to generate dynamic paths
export async function generateStaticParams() {
  const allPosts = await getSortedPostsData();
  const size = configuration.rollSize;
  const numberOfPages = Math.ceil(allPosts.length / size);

  const paths = [];
  for (let i = 1; i <= numberOfPages; i++) {
    paths.push({ roll: `${i}` });
  }

  return paths;
}

// Dynamic metadata for each page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ roll: string }>;
}): Promise<Metadata> {
  const p = await params;
  const allPosts = await getSortedPostsData();
  const size = configuration.rollSize;
  const currentPage = parseInt(p.roll, 10);
  const totalPages = Math.ceil(allPosts.length / size);

  return {
    title: `Blog - Page ${currentPage} of ${totalPages}`,
    description: `Explore blog posts on page ${currentPage} of ${totalPages}.`,
  };
}

export default async function BlogRollPage({
  params,
}: {
  params: { roll: string };
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
    <div className={'bg-base-200 py-10'}>
      <BlogRoll pageContext={rollContext} />
    </div>
  );
}
