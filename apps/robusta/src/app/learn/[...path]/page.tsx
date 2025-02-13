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
import { Article } from '@/components/blog/article/Article';
import { AppRouterPage, PAGES } from '@/app/router';
import { setRouterPath } from '@robusta/pyramids-helpers';
import { Metadata } from 'next';
import { uniqueBy } from '@robusta/pyramids-helpers/dist/arrays/unique-by';
import { BlogRoll } from '@/components/blog/BlogRoll';
import { getSeoPyramidsConfig } from '@/seopyramids.config';
import { getCategories } from '@/logic/categories/robusta-categories';
import { parseUrl } from '@/logic/routing/parse-url';
import { CategoryRoll } from '@/components/blog/categories/CategoryRoll';

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

  const url = '/learn/' + path.join('/');

  const urlSegmentParts = path;
  if (urlSegmentParts.length === 0) {
    console.log('No path, 404');
    return notFound();
  }
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const posts = await getSortedPostsData(blogConfig);
  const tags = getValuableTags(posts);
  const allCategories = await blogConfig.getCategories();

  const route = parseUrl(
    url,
    '/learn',
    blogConfig.defaultLocale,
    blogConfig.otherLocales,
    allCategories,
  );

  if (!route) {
    console.log('No route, 404', url);
    return notFound();
  }

  if (route.type === 'BLOG_ROLL') {
    const rollSize = blogConfig.rollSize;
    const rollContext = getRollContext(posts, rollSize, route.page || 1);
    return <BlogRoll rollContext={rollContext} route={route} />;
  }

  if (route.type === 'CATEGORY') {
    const categoryPath = route.categories!.join('/');
    const categoryPosts = getPostsByCategory(categoryPath, posts);
    const rollSize = blogConfig.rollSize;
    const rollContext = {
      ...getRollContext(categoryPosts, rollSize, route.page || 1),
      categories: route.categories!,
    };
    return <CategoryRoll pageContext={rollContext} route={route} />;
  }

  if (urlSegmentParts.length === 1) {
    const tagOrCategory = urlSegmentParts[0];
    const tagPosts = getPostsByTag(tagOrCategory, posts);
    const categoryPost = getPostsByCategory(tagOrCategory, posts);

    // make Post unique by slug
    const filteredPost = uniqueBy([tagPosts, categoryPost], 'slug');
    const rollSize = blogConfig.rollSize;
    const rollContext = getRollContext(filteredPost, rollSize, 1);
    return <BlogRoll rollContext={rollContext} route={route} />;
  }

  const slug = route.slug!; // Extract the last part as the slug
  const categoryPath = route.categories!.join('/'); // Remaining parts form the category path

  const post = await getPostByCategoryAndSlug(blogConfig, categoryPath, slug);
  if (!post) {
    console.log('No post found, 404', categoryPath, slug);
    return notFound();
  }

  const valuableTags = post.tags.filter((t) => tags.includes(t));

  return <Article post={post} valuableTags={valuableTags} route={route} />;
}
