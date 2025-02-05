import { notFound } from 'next/navigation';
import {
  getPostByCategoryAndSlug,
  getRollContext,
  getSortedPostsData,
} from '@/logic/posts';
import {
  getPostsByCategory,
  getPostsByTag,
  getValuableTags,
} from '@/logic/tags';
import { Article } from '@/components/blog/Article';
import { AppRouterPage, PAGES } from '@/app/router';
import { setRouterPath } from '@robusta/pyramids-helpers';
import { Metadata } from 'next';
import { uniqueBy } from '@robusta/pyramids-helpers/dist/arrays/unique-by';
import { BlogRoll } from '@/components/blog/BlogRoll';
import { getSeoPyramidsConfig } from '@/seopyramids.config';

setRouterPath<AppRouterPage>(PAGES.BLOG_POST);
export const metadata: Metadata = {
  //title: 'My Page',
  //description: 'This page includes external scripts',
  icons: '/favicon.ico',
  other: {
    stylesheet:
      'https://cdnjs.cloudflare.com/ajax/libs/prism-themes/1.9.0/prism-coy-without-shadows.min.css',
  },
};
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ path: string[] }>;
}) {
  const { path } = await params; // ['blockchain', 'tools', 'tooling-for-solidity-coders']
  const pathParts = path;
  if (pathParts.length === 0) {
    return notFound();
  }
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const posts = await getSortedPostsData(blogConfig);
  const tags = getValuableTags(posts);

  if (pathParts.length === 1) {
    const tagOrCategory = pathParts[0];
    const tagPosts = getPostsByTag(tagOrCategory, posts);
    const categoryPost = getPostsByCategory(tagOrCategory, posts);

    // make Post unique by slug
    const filteredPost = uniqueBy([tagPosts, categoryPost], 'slug');
    const rollSize = blogConfig.rollSize;
    const rollContext = getRollContext(filteredPost, rollSize, 1);
    return <BlogRoll pageContext={rollContext} />;
  }

  const slug = pathParts.pop()!; // Extract the last part as the slug
  const category = pathParts.join('/'); // Remaining parts form the category path

  const post = await getPostByCategoryAndSlug(blogConfig, category, slug);
  if (!post) {
    return notFound();
  }

  const valuableTags = post.tags.filter((t) => tags.includes(t));

  return <Article post={post} valuableTags={valuableTags} />;
}
