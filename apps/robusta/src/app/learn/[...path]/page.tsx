import { notFound } from 'next/navigation';
import {
  getPostByCategoryAndSlug,
  getRollContext,
  getSortedPostsData,
} from '@/logic/posts';
import { getPostsByTag, getValuableTags } from '@/logic/tags';
import { Article } from '@/components/blog/article/Article';
import { AppRouterPage, PAGES } from '@/app/router';
import { setRouterPath, uniqueBy } from '@robusta/pyramids-helpers';
import { Metadata } from 'next';
import { BlogRoll } from '@/components/blog/BlogRoll';
import { getSeoPyramidsConfig } from '@/seopyramids.config';
import { parseUrl } from '@/logic/routing/parse-url';
import { CategoryRoll } from '@/components/blog/categories/CategoryRoll';
import { getPostsByCategory } from '@/logic/categories/robusta-categories';

type RouteParams = {
  path: string[];
};

setRouterPath<AppRouterPage>(PAGES.BLOG_POST);

export const dynamic = 'force-static';
export const revalidate = false;

export async function generateStaticParams(): Promise<RouteParams[]> {
  const result: RouteParams[] = [];
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const allPosts = await getSortedPostsData(blogConfig);

  const allCategories = await blogConfig.getCategories();
  const allCategoryPaths = allCategories.map((category) => ({
    path: category,
  }));

  // Adding home page of each category roll
  allCategoryPaths.forEach((category) => {
    result.push(category);
  });

  // Adding additional pages of each category roll
  for (const category of allCategories) {
    const categoryPath = category.join('/');
    const categoryPosts = getPostsByCategory(categoryPath, allPosts);
    const rollSize = blogConfig.rollSize;
    const numberOfPages = Math.ceil(categoryPosts.length / rollSize);
    if (numberOfPages > 1) {
      for (let i = 2; i <= numberOfPages; i++) {
        result.push({
          path: category.concat(['page', i.toString()]),
        });
      }
    }
  }

  // Adding post page
  const allPostsPaths = allPosts.map((post) => ({
    path: [post.category, 's', post.slug],
  }));
  allPostsPaths.forEach((post) => {
    result.push(post);
  });
  return result;
}

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
    return (
      <div className={'bg-base-200 py-10'}>
        <BlogRoll rollContext={rollContext} route={route} />
      </div>
    );
  }

  if (route.type === 'CATEGORY') {
    const categoryPath = route.categories!.join('/');
    const categoryPosts = getPostsByCategory(categoryPath, posts);
    const rollSize = blogConfig.rollSize;
    const rollContext = {
      ...getRollContext(categoryPosts, rollSize, route.page || 1),
      categories: route.categories!,
    };
    return (
      <div className={'bg-base-200 py-10'}>
        <CategoryRoll rollContext={rollContext} route={route} />
      </div>
    );
  }

  if (urlSegmentParts.length === 1) {
    const tagOrCategory = urlSegmentParts[0];
    const tagPosts = getPostsByTag(tagOrCategory, posts);
    const categoryPost = getPostsByCategory(tagOrCategory, posts);

    // make Post unique by slug
    const filteredPost = uniqueBy([tagPosts, categoryPost], 'slug');
    const rollSize = blogConfig.rollSize;
    const rollContext = getRollContext(filteredPost, rollSize, 1);
    return (
      <div className={'bg-base-200 py-10'}>
        <BlogRoll rollContext={rollContext} route={route} />
      </div>
    );
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
