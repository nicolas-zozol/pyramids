import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { immutableSlugify } from '@robusta/pyramids-helpers';

// TODO: some or all are mandatory
// frontMatter should have not mandatories, and we should create post from frontmatter
export interface PostFrontMatter {
  date: string;
  modified?: string;
  title: string;
  categoryPath?: string;
  tags?: string[];
  locale?: string;
  image?: string;
  slug?: string;
  excerpt: string;
  author?: string;
  enVersion?: string;
  frVersion?: string;
  featured?: boolean;
  keywords?: string[];
}

export interface IPost {
  date: string;
  modified?: string;
  title: string;
  categories?: string[];
  categoryPath?: string;
  tags: string[];
  locale: string;
  image?: string;
  slug: string;
  excerpt: string;
  author?: string;
  enVersion?: string;
  frVersion?: string;
  featured: boolean;
  content: string;
  keywords: string[];
}

export class Post implements IPost {
  date!: string;
  modified?: string;
  title!: string;
  categories: string[] = [];
  categoryPath?: string;
  tags: string[] = [];
  locale: string = 'fr';
  image?: string;
  slug!: string;
  excerpt!: string;
  author: string = 'Nicolas Zozol';
  enVersion?: string;
  frVersion?: string;
  featured: boolean = false;
  content!: string;
  keywords: string[] = [];

  constructor(
    p: IPost,
    protected blogHome: string,
    protected isDefaultLocale: boolean,
  ) {
    Object.assign(this, p);
  }

  getFilePath(): string {
    const categoryPath = this.categories.join('/');
    return `/${this.slug}`;
  }

  /**
   * IMPORTANT: this URL should not change over time
   * otherwise it will break SEO backlinks
   */
  getImmutableUrl(): string {
    const localeSegment = this.isDefaultLocale ? '' : `/${this.locale}`;
    return `/${this.blogHome}/${localeSegment}/${this.categoryPath}/${this.slug}`;
  }
}

export interface PostMetaData {
  id: string;
}

function traverseDir(dir: string, action: (path: string) => void) {
  const home = process.cwd();
  const dirPath = path.join(home, dir);
  fs.readdirSync(dirPath).forEach((file) => {
    let fullPath = path.join(dir, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      traverseDir(fullPath, action);
    } else {
      action(fullPath);
    }
  });
}

export interface BlogConfig {
  defaultLocale: string;
  otherLocales: string[];
  debugImagePath: boolean;
  mandatoryKeywords: string[];
  rollSize: number;
  author?: string;
  getCategories: () => Promise<string[][]>;
}

// should be renamed as createPost or hydratePost, with validation
function validateFrontMatter(
  config: BlogConfig,
  frontMatter: Partial<PostFrontMatter>,
  filePath: string,
  requestedLocale: string,
): Post {
  let iPost: Partial<IPost> = {};
  if (!frontMatter.date) {
    throw 'No date: ' + filePath;
  }

  if (frontMatter.date.length !== 10) {
    throw `${filePath} : Wrong date format:${frontMatter.date} - use YYYY-MM-DD`;
  }
  if (!frontMatter.title) {
    throw 'No title: ' + filePath;
  }

  // -- END OF MANDATORY DATA

  iPost = { ...frontMatter };

  if (!frontMatter.tags) {
    iPost.tags = [];
  }

  if (!frontMatter.locale) {
    iPost.locale = requestedLocale;
  }

  if (!frontMatter.author) {
    iPost.author = config.author || 'Nicolas Zozol';
  }

  if (frontMatter.image) {
    let imagePath = frontMatter.image;
    if (imagePath.startsWith('./')) {
      imagePath = imagePath.slice(2);
    }
    if (imagePath.startsWith('images')) {
      imagePath = imagePath.slice('images'.length);
    }
    if (!imagePath.startsWith('/')) {
      imagePath = '/' + imagePath;
    }
    // TODO: assert image exists
    if (config.debugImagePath) {
      console.log(`${filePath} => Found frontMatter.image: ${imagePath}`);
    }

    iPost.image = imagePath;
  }
  if (!frontMatter.featured) {
    iPost.featured = false;
  }
  if (!frontMatter.slug) {
    const locale = iPost.locale!.toLowerCase();
    iPost.slug = immutableSlugify(frontMatter.title, locale);
  }

  // If no keywords, use tags as keywords
  if (!frontMatter.keywords) {
    frontMatter.keywords = [...iPost.tags!, ...config.mandatoryKeywords];
  } else {
    iPost.keywords = [...frontMatter.keywords, ...config.mandatoryKeywords];
  }

  return new Post(
    iPost as IPost,
    'spots',
    iPost.locale?.toLowerCase() === config.defaultLocale.toLowerCase(),
  );
}

const spotsCache = new Map<string, Post[]>();

// TODO: this is awful and should be refactored
// TODO: it does at the same time frontMatter validation and mapping to post creation
// TODO: but also file traversing, which is a configuration job
export async function getSortedSpots(
  config: BlogConfig,
  locale: string,
): Promise<Post[]> {
  const key = (locale || config.defaultLocale).toLowerCase();
  if (spotsCache.has(key)) {
    return sortPostsByDate(spotsCache.get(key)!);
  }

  const pendings: Promise<any>[] = [];
  const posts: Post[] = [];
  const baseDir = `content/spots/${key}`;

  // If locale folder does not exist, return empty list
  const baseAbs = path.join(process.cwd(), baseDir);
  if (!fs.existsSync(baseAbs)) {
    spotsCache.set(key, posts);
    return posts;
  }

  let i = 0;
  traverseDir(baseDir, (p) => {
    if (p.endsWith('.md')) {
      const fileContents = fs.readFileSync(p, 'utf8');

      const matterResult = matter(fileContents, {
        excerpt: true,
      });
      const frontMatter: PostFrontMatter = matterResult.data as PostFrontMatter;
      const post = validateFrontMatter(config, frontMatter, p, key);
      if (!matterResult.excerpt) {
        throw 'Error reading frontMatter content: No excerpt: ' + p;
      }
      frontMatter.excerpt = matterResult.excerpt;

      const processedContentPromise = remark().use(html).process(matterResult.content);
      pendings.push(processedContentPromise);

      processedContentPromise.then((content) => {
        const contentHtml = content.toString();
        post.slug = immutableSlugify(frontMatter.title, post.locale);
        post.content = contentHtml;
        posts.push(post);
      });
      i++;
    }
  });

  await Promise.all(pendings);
  spotsCache.set(key, posts);
  return sortPostsByDate(posts);
}

export function sortPostsByDate(posts: Post[]): Post[] {
  return posts.sort(({ date: a }, { date: b }) => (a < b ? 1 : -1));
}

export async function fetchSpotBySlug(
  blogConfig: BlogConfig,
  locale: string,
  slug: string,
): Promise<Post | undefined> {
  const allPosts = await getSortedSpots(blogConfig, locale);
  return allPosts.find(
    (post) => trimSlash(post.slug).toLowerCase() === trimSlash(slug).toLowerCase(),
  );
}

function trimSlash(path: string): string {
  return path.replace(/^\/|\/$/g, '');
}
