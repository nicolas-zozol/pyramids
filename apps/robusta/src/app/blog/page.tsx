import { getSortedPostsData } from '@/logic/posts';
import { configuration } from '@/logic/configuration';
import type { Metadata } from 'next';
import BlogRoll from '@/components/blog/blog-roll';

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
  const size = configuration.rollSize;

  const rollContext = {
    currentPage: 1,
    rollSize: size,
    numberOfPages: Math.ceil(posts.length / size),
    roll: posts.slice(0, size),
  };

  return (
    <>
      <BlogRoll pageContext={rollContext} />
    </>
  );
}
