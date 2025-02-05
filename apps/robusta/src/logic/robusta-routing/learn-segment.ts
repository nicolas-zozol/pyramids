import {
  getAllLocales,
  getDefaultLocale,
} from '@/logic/robusta-routing/get-locales';
import { Post } from '@/logic/posts';
import { BlogSegments, BlogSegmentsResolver } from '@/logic/routing/segments';

export class RobustaBlogSegmentsResolver implements BlogSegmentsResolver {
  resolve(segments: string[]): BlogSegments {
    return getBlogSegments(this.allPosts, segments, this.blogSlug);
  }

  constructor(
    private allPosts: Post[],
    private blogSlug: string,
  ) {}
}

function getBlogSegments(
  allPosts: Post[],
  segments: string[],
  blogSlug: string,
): BlogSegments {
  const allLocales = getAllLocales();

  if (segments.length === 0) {
    return {
      blogHome: true,
      locale: undefined,
      categories: [],
      slug: undefined,
      defaultLocale: true,
    };
  }
  const first = segments[0];

  if (first === blogSlug) {
    throw new Error(
      `Blog slug ${blogSlug} should not be in the segments : ${segments.join('/')}`,
    );
  }

  let locale: string = getDefaultLocale();
  let defaultLocale = true;
  let workingSegments = segments;

  if (allLocales.includes(first)) {
    locale = first;
    defaultLocale = false;
    workingSegments = segments.slice(1);
  }

  if (workingSegments.length === 0) {
    return {
      blogHome: true, // blogHome for that locale
      locale,
      categories: [],
      slug: undefined,
      defaultLocale: false,
    };
  }

  /**
   * Now two possibilities:
   *     - either we have a slug with at least one category
   *     - or we have categories page, with no slug
   *
   *     The second case require to check every post to see if the slug
   *     correspond to the last segment of the url.
   *     This is possible at build time with ISR, but not with dynamic routing.
   */

  const possibleSlug: string = workingSegments.pop()!;
  for (const post of allPosts) {
    // It's clearly possible to optimise this by using a map of slugs built only once
    // Here we are looping for every post on every slug, which is O(n^2)
    if (
      post.slug === possibleSlug &&
      post.locale.toLowerCase() === locale.toLowerCase()
    ) {
      // TODO: in theory, we should check if the post is in the right category
      // because the slug can be the same as a category name

      return {
        blogHome: false,
        locale,
        categories: workingSegments,
        slug: possibleSlug,
        defaultLocale,
      };
    }
  }

  // If we are here, we have a categories page
  // but we removed the last category from the segments
  const slug = '';
  return {
    blogHome: false,
    locale,
    categories: [...workingSegments, possibleSlug],
    slug,
    defaultLocale,
  };
}
