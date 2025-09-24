import * as fs from 'fs';
import * as path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { immutableSlugify } from '@robusta/pyramids-helpers';
import { getSeoPyramidsConfig } from '@/seopyramids.config';
import { Post, IPost } from '@/logic/fetch-spots';

export type Page = Post;

function normalizeImagePath(
  imagePath: string,
  filePath: string,
  debug: boolean,
): string {
  let p = imagePath;
  if (p.startsWith('./')) p = p.slice(2);
  if (p.startsWith('images')) p = p.slice('images'.length);
  if (!p.startsWith('/')) p = '/' + p;
  if (debug) console.log(`${filePath} => Found frontMatter.image: ${p}`);
  return p;
}

export async function fetchPageByFilename(
  locale: string,
  filepath: string,
): Promise<Page | undefined> {
  const { blogConfig } = getSeoPyramidsConfig();
  const localeKey = (locale || blogConfig.defaultLocale).toLowerCase();

  const baseDir = path.join(process.cwd(), 'content', localeKey);
  if (filepath.endsWith('.md')) {
    console.warn(
      `Avoid using .md extension in fetchPageByFilename: ${filepath}`,
    );
  }
  const filename = filepath.endsWith('.md') ? filepath : `${filepath}.md`;
  const absPath = path.join(baseDir, filename);

  if (!fs.existsSync(absPath)) {
    console.warn(`File not found: ${absPath}`);
    return undefined;
  }

  const fileContents = fs.readFileSync(absPath, 'utf8');
  const matterResult = matter(fileContents, { excerpt: true });
  const fm = matterResult.data as any;

  if (!fm.date) throw `No date: ${absPath}`;
  if (typeof fm.date !== 'string' || fm.date.length !== 10)
    throw `${absPath} : Wrong date format:${fm.date} - use YYYY-MM-DD`;
  if (!fm.title) throw `No title: ${absPath}`;

  const post: Partial<IPost> = {};
  post.title = fm.title;
  post.date = fm.date;
  post.modified = fm.updated;
  post.tags = fm.tags ?? [];
  post.locale = (fm.lang ?? localeKey).toLowerCase();
  post.author = fm.author || blogConfig.author || 'Nicolas Zozol';

  if (fm.image) {
    post.image = normalizeImagePath(
      fm.image,
      absPath,
      Boolean(blogConfig.debugImagePath),
    );
  }

  post.featured = false;
  post.slug = fm.slug ? fm.slug : immutableSlugify(post.title!, post.locale!);

  if (fm.category) {
    post.categories = [fm.category];
    post.categoryPath = fm.category;
  } else {
    post.categories = [];
  }

  const mandatoryKeywords = Array.isArray(blogConfig.mandatoryKeywords)
    ? blogConfig.mandatoryKeywords
    : [];
  const providedKeywords = Array.isArray(fm.keywords) ? fm.keywords : [];
  post.keywords = [...providedKeywords, ...mandatoryKeywords];

  const processed = await remark().use(html).process(matterResult.content);
  post.content = processed.toString();

  // Prefer gray-matter excerpt, fallback to description, else empty
  post.excerpt = matterResult.excerpt || fm.description || '';

  const page = new Post(
    post as IPost,
    'guides',
    post.locale!.toLowerCase() === blogConfig.defaultLocale.toLowerCase(),
  );
  return page as Page;
}
