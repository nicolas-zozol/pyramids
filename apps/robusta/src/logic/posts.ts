import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { immutableSlugify } from '@/logic/routing/slugify';

// TODO: some or all are mandatory
// frontMatter should have not mandatories, and we should create post from frontmatter
export interface PostFrontMatter {
  date: string;
  modified?: string;
  title: string;
  category: string;
  tags: string[];
  locale?: string;
  image?: string;
  slug?: string;
  excerpt: string;
  author?: string;
  enVersion?: string;
  frVersion?: string;
  featured?: boolean;
  keywords: string[];
}

export interface IPost {
  date: string;
  modified?: string;
  title: string;
  category: string;
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
  category!: string;
  tags!: string[];
  locale!: string;
  image!: string;
  slug!: string;
  excerpt!: string;
  author?: string;
  enVersion?: string;
  frVersion?: string;
  featured: boolean = false;
  content!: string;
  keywords: string[] = [];

  constructor(
    p: IPost,
    protected blogSlug: string,
    protected isDefaultLocale: boolean,
  ) {
    Object.assign(this, p);
  }

  getFilePath(): string {
    return `/${this.category}/${this.slug}`;
  }

  /**
   * IMPORTANT: this URL should not change over time
   * otherwise it will break SEO backlinks
   */
  getImmutableUrl(): string {
    const localeSegment = this.isDefaultLocale ? '' : `/${this.locale}`;
    return `/${this.blogSlug}/${localeSegment}/${this.category}/${this.slug}`;
  }
}

export interface RollContext {
  currentPage: number;
  numberOfPages: number;
  rollSize: number;
  roll: Post[];
}

export function getRollContext(
  posts: Post[],
  rollSize: number,
  currentPage: number,
): RollContext {
  if (currentPage < 1) {
    throw 'currentPage starts at 1';
  }

  const start = (currentPage - 1) * rollSize;
  const end = start + rollSize;
  const roll = posts.slice(start, end);
  const numberOfPages = Math.ceil(posts.length / rollSize);

  return {
    currentPage,
    roll,
    numberOfPages,
    rollSize,
  };
}

export interface PostMetaData {
  id: string;
}

function traverseDir(dir: string, action: (path: string) => void) {
  fs.readdirSync(dir).forEach((file) => {
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
  debugImagePath: boolean;
  mandatoryKeywords: string[];
  rollSize: number;
  author?: string;
}

// should be renamed as createPost or hydratePost, with validation
function validateFrontMatter(
  config: BlogConfig,
  frontMatter: Partial<PostFrontMatter>,
  filePath: string,
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
  if (!frontMatter.category) {
    throw 'No category: ' + filePath;
  }
  if (!filePath.includes(frontMatter.category)) {
    throw `Wrong category ${frontMatter.category} from path: ${filePath}`;
  }

  // -- END OF MANDATORY DATA

  iPost = { ...frontMatter };

  if (!frontMatter.tags) {
    iPost.tags = [];
  }

  if (!frontMatter.locale) {
    iPost.locale = config.defaultLocale.toLowerCase();
  }

  if (!frontMatter.author) {
    iPost.author = config.author;
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
    'learn',
    iPost.locale?.toLowerCase() === config.defaultLocale.toLowerCase(),
  );
}

const posts: Post[] = [];
let postsGenerated = false;

// TODO: this is awful and should be refactored
// TODO: it does at the same time frontMatter validation and mapping to post creation
// TODO: but also file traversing, which is a configuration job
export async function getSortedPostsData(config: BlogConfig): Promise<Post[]> {
  // Get file names under /posts
  //const skipPrism = process.env.SKIP_PRISM === 'true'
  // console.log({skipPrism})
  const pendings: Promise<any>[] = [];
  if (postsGenerated) {
    console.log('+++++ Using cache ');
    return sortPostsByDate(posts);
  } else {
    console.log('==== Calculating all');
    postsGenerated = true;
  }
  let i = 0;
  traverseDir('content/blog', (path) => {
    if (path.includes('.md')) {
      const fileContents = fs.readFileSync(path, 'utf8');

      // Use gray-matter to parse the post metadata section

      const matterResult = matter(fileContents, {
        excerpt: true,
      });
      const frontMatter: PostFrontMatter = matterResult.data as PostFrontMatter;
      const post = validateFrontMatter(config, frontMatter, path);
      if (!matterResult.excerpt) {
        throw 'Error reading frontMatter content: No excerpt: ' + path;
      }
      frontMatter.excerpt = matterResult.excerpt;

      let parser = remark().use(html);

      const processedContentPromise = parser.process(matterResult.content);
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
  return sortPostsByDate(posts);
}

export function sortPostsByDate(posts: Post[]): Post[] {
  return posts.sort(({ date: a }, { date: b }) => (a < b ? 1 : -1));
}

export async function getPostByCategoryAndSlug(
  blogConfig: BlogConfig,
  categoryPath: string,
  slug: string,
): Promise<Post | undefined> {
  const posts = await getSortedPostsData(blogConfig);

  return posts.find(
    (post) =>
      trimSlash(post.category).toLowerCase() ===
        trimSlash(categoryPath).toLowerCase() &&
      trimSlash(post.slug).toLowerCase() === trimSlash(slug).toLowerCase(),
  );
}

function trimSlash(path: string): string {
  return path.replace(/^\/|\/$/g, '');
}
