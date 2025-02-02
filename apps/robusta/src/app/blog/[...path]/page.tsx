import { notFound } from 'next/navigation';
import { getPostByCategoryAndSlug, getSortedPostsData } from '@/logic/posts';
import { getValuableTags } from '@/logic/tags';
import { Article } from '@/components/blog/Article';
import { AppRouterPage, PAGES } from '@/app/router';
import { setRouterPath } from '@robusta/pyramids-helpers';

setRouterPath<AppRouterPage>(PAGES.BLOG_POST);

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params; // ['blockchain', 'tools', 'tooling-for-solidity-coders']
  const pathParts = path;
  if (pathParts.length <= 1) return notFound();

  const slug = pathParts.pop()!; // Extract the last part as the slug
  const category = pathParts.join('/'); // Remaining parts form the category path

  const post = await getPostByCategoryAndSlug(category, slug);
  if (!post) {
    return notFound();
  }
  const posts = await getSortedPostsData();
  const tags = getValuableTags(posts);

  const valuableTags = post.tags.filter((t) => tags.includes(t));

  return <Article post={post} valuableTags={valuableTags} />;
}
