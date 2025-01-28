import { notFound } from 'next/navigation';
import {
  getPostByCategoryAndSlug,
  getSortedPostsData,
  Post,
} from '@/logic/posts';
import { getValuableTags, Tag } from '@/logic/tags';
import { Article } from '@/components/blog/Article';

interface Props {
  host: string;
  post: Post;
  valuableTags: Tag[];
}

export default async function BlogPostPage({
  params,
}: {
  params: { path: string[] };
}) {
  const pathParts = params.path; // ['blockchain', 'tools', 'tooling-for-solidity-coders']

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
