import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import type { ArticleBody, ArticleEntry, CorpusSpec } from './contract.js';

/**
 * The one place an article body is rendered (R-CONTENTSOURCE-06). It takes the
 * entry and not a slug, so the file is resolved once, by the traversal that
 * already found it — answering "what articles exist" never costs a render.
 *
 * It is not memoized: one page asks for one body once, and the index is what
 * every other caller wants.
 */
export async function readArticleBody(
  corpus: CorpusSpec,
  entry: ArticleEntry,
): Promise<ArticleBody> {
  const file = join(resolve(process.cwd(), corpus.root), entry.path);
  const { content } = matter(await readFile(file, 'utf8'));
  const rendered = await remark().use(remarkHtml).process(content);

  return { html: String(rendered) };
}
