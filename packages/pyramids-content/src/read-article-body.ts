import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import matter from 'gray-matter';
import type { Root } from 'mdast';
import { remark } from 'remark';
import remarkHtml from 'remark-html';
import { visit } from 'unist-util-visit';
import { resolveAssetUrl } from './asset-reference.js';
import type { ArticleBody, ArticleEntry, CorpusSpec } from './contract.js';

/**
 * The one place an article body is rendered (R-CONTENTSOURCE-06). It takes the
 * entry and not a slug, so the file is resolved once, by the traversal that
 * already found it — answering "what articles exist" never costs a render.
 *
 * It is not memoized: one page asks for one body once, and the index is what
 * every other caller wants.
 *
 * The HTML it returns is servable as-is: every image reference the body carries
 * has been through `resolveAssetUrl` (R-ARTICLEPAGE-21), so no article-relative
 * form survives into the page. remark-html sanitizes by default and that default
 * is kept (R-ARTICLEPAGE-27) — raw HTML written in a body is dropped whole,
 * which is why an `<img>` tag reaches neither the resolver nor the DOM.
 */
export async function readArticleBody(
  corpus: CorpusSpec,
  entry: ArticleEntry,
): Promise<ArticleBody> {
  const file = join(resolve(process.cwd(), corpus.root), entry.path);
  const { content } = matter(await readFile(file, 'utf8'));
  const rendered = await remark()
    .use(resolveImageReferences, corpus, entry)
    .use(remarkHtml)
    .process(content);

  return { html: String(rendered) };
}

/**
 * Resolution runs on the syntax tree, before serialization, so the one rule
 * `asset-reference.ts` states has one implementation — a second pass over the
 * output string would restate it, which is the drift that module exists to
 * prevent. A site therefore links through the same resolver that validates a
 * reference and publishes its file.
 *
 * An inline image carries its own URL; a reference-style one names a definition,
 * and only the definitions an image names are resolved, a link's own URL being
 * no image reference.
 */
function resolveImageReferences(corpus: CorpusSpec, entry: ArticleEntry) {
  return (tree: Root): void => {
    const named = new Set<string>();
    visit(tree, 'imageReference', (node) => {
      named.add(node.identifier);
    });

    visit(tree, 'image', (node) => {
      node.url = resolveAssetUrl(corpus, entry, node.url);
    });
    visit(tree, 'definition', (node) => {
      if (named.has(node.identifier)) {
        node.url = resolveAssetUrl(corpus, entry, node.url);
      }
    });
  };
}
