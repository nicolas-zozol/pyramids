import {
  categoriesHome,
  categoriesPageParser,
  firstWordParser,
  pageParser,
  postParser,
} from '@/logic/routing/masala-route-parser';

type RouteType = 'BLOG_ROLL' | 'CATEGORY' | 'POST';

export interface ParsedRoute {
  url: string;
  home: string;
  type: RouteType;
  isDefaultLocale: boolean;
  locale: string; // 'en' or 'fr'
  categories?: string[] | undefined; // e.g. ['blockchain', 'security']
  slug?: string | undefined;
  page?: number; // 2 if route ends in /page/2, undefined if not paginated
}

// example
const allCategories = [
  ['blockchain'],
  ['blockchain/security'],
  ['seo'],
  ['react'],
];

export function parseUrl(
  url: string,
  home: string,
  defaultLocale: string,
  otherLocales: string[],
  allCategories: string[][],
): ParsedRoute | undefined {
  const initialUrl = url;
  if (!url.startsWith('/')) {
    throw 'url must start with / : ' + url;
  }

  if (!home.startsWith('/')) {
    throw 'home must start with / : ' + home;
  }

  url = cleanUrl(url);

  if (!url.startsWith(home)) {
    return undefined;
  }

  url = url.slice(home.length);

  let isDefaultLocale = true;
  let locale = defaultLocale;

  for (const current of otherLocales) {
    if (firstWordParser.val(url) === current) {
      locale = current;
      url = url.slice(`/${current}`.length);
      isDefaultLocale = false;
      break;
    }
  }

  if (url === '') {
    return {
      url: initialUrl,
      home,
      type: 'BLOG_ROLL',
      isDefaultLocale,
      locale,
      page: 1,
    };
  }

  let blogRollPage = pageParser.val(url);
  if (blogRollPage) {
    return {
      url: initialUrl,
      home,
      type: 'BLOG_ROLL',
      isDefaultLocale,
      locale,
      ...blogRollPage,
    };
  }

  const catHome = categoriesHome(allCategories).val(url);
  const catPage = categoriesPageParser(allCategories).val(url);
  const post = postParser(allCategories).val(url);
  if (catHome) {
    return {
      url: initialUrl,
      home,
      type: 'CATEGORY',
      isDefaultLocale,
      locale,
      ...catHome,
      page: 1,
    };
  }

  if (catPage) {
    return {
      url: initialUrl,
      home,
      isDefaultLocale,
      locale,
      ...catPage,
    };
  }

  if (post) {
    return {
      url: initialUrl,
      home,
      isDefaultLocale,
      locale,
      ...post,
    };
  }

  return undefined;
}

/**
 * Cleans a URL string by normalizing consecutive slashes and removing a trailing slash.
 *
 * @example
 *  cleanUrl("/fr/home//blog/") -> "/fr/home/blog"
 *  cleanUrl("   //fr///home///blog///  ") -> "/fr/home/blog"
 *  cleanUrl("/") -> "/"
 */
export function cleanUrl(url: string): string {
  // Trim whitespace
  let result = url.trim();

  // Replace multiple slashes (//+) with a single slash
  result = result.replace(/\/{2,}/g, '/');

  // Remove trailing slash if the result is longer than 1 char
  // (so we don't turn "/" into "")
  if (result.length > 1 && result.endsWith('/')) {
    result = result.slice(0, -1);
  }

  return result;
}
