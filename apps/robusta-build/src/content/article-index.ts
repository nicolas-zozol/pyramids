/**
 * Package content — the site's corpus, declared as data, and every read of it: the article index, a body, an asset URL, an article by its address, the translation notices.
 *
 * Design: features/__done/pyramid-v2-epic/__done/multilingual-site/multilingual-site.design.md
 * Requirements: R-MULTILINGUAL-05, R-MULTILINGUAL-84, R-MULTILINGUAL-86
 * Design: features/__done/pyramid-v2-epic/__done/content-source/content-source.design.md
 * Requirements: R-CONTENTSOURCE-01, R-CONTENTSOURCE-22, R-CONTENTSOURCE-47, R-CONTENTSOURCE-62
 * Design: features/__done/pyramid-v2-epic/__done/migrate-learn-content/migrate-learn-content.design.md
 * Requirements: R-MIGRATELEARN-24, R-MIGRATELEARN-82
 * Design: features/__done/pyramid-v2-epic/__done/article-page/article-page.design.md
 * Requirements: R-ARTICLEPAGE-06, R-ARTICLEPAGE-22
 * Design: features/__done/pyramid-v2-epic/__done/seo-excellence/seo-excellence.design.md
 * Requirements: R-SEOEXCELLENCE-02, R-SEOEXCELLENCE-81, R-SEOEXCELLENCE-101
 * Design: features/__done/pyramid-v2-epic/__done/retire-robusta-v1/retire-robusta-v1.design.md
 * Requirements: R-RETIREV1-41, R-RETIREV1-61
 */
import type { Nodes } from 'mdast';
import { remark } from 'remark';
import {
  describeViolation,
  readArticleBody,
  readCorpus,
  resolveAssetUrl,
  type ArticleBody,
  type ArticleEntry,
  type TranslationNotice,
} from './corpus-reader/index.ts';
import { corpus } from './corpus.ts';

/**
 * The seam `seo-url-scheme` left and `content-source` implemented. The name the
 * route table imports does not move; the type has one definition, in the base.
 *
 * The entry deliberately carries no article body: answering what articles exist
 * must never cost a render (R-CONTENTSOURCE-06). What it carries is what a
 * listing can show without opening a body — a title, a date, an excerpt, an
 * image, the categories and tags related articles are chosen on.
 *
 * Called at build time only — from the page-data handlers, the prerender page
 * list and the build scripts — and from nothing else (BR-PYRAMID-7).
 */
export type ArticleIndexEntry = ArticleEntry;

/**
 * The single place a corpus violation becomes fatal (R-CONTENTSOURCE-47).
 * `readCorpus` returns violations and never throws; every consumer passes
 * through here, `emit-v1-map.mjs` included, so a corpus that breaks the
 * schema fails `yarn emit:v1-map` before `vite build` starts — the earliest
 * possible failure, with the file named.
 */
export async function getArticleIndex(): Promise<readonly ArticleIndexEntry[]> {
  const { articles, violations } = await readCorpus(corpus);

  if (violations.length > 0) {
    const lines = violations.map(
      (violation) => `  - ${describeViolation(violation)}`,
    );
    throw new Error(
      `The article corpus breaks its schema:\n${lines.join('\n')}`,
    );
  }

  return articles;
}

/** The corpus read's translation notices, which fail nothing: `check:translations` prints them. */
export async function getTranslationNotices(): Promise<
  readonly TranslationNotice[]
> {
  return (await readCorpus(corpus)).translationNotices;
}

/** Where an article page's copy comes from, and from nowhere else (BR-PYRAMID-8). */
export function getArticleBody(entry: ArticleIndexEntry): Promise<ArticleBody> {
  return readArticleBody(corpus, entry);
}

/**
 * The seam a cover is resolved through (R-ARTICLEPAGE-22). `ArticleEntry.image`
 * is documented as declared and unresolved, so the URL it is served at is
 * computed here rather than read.
 *
 * Symmetric with `getArticleBody`, and for the same reason: `corpus.ts` is a leaf
 * that `seopyramids.config.ts` reads, and a component importing it would make it
 * a second entry point into the corpus declaration. A body needs no such seam —
 * `readArticleBody` resolves its own references inside the base.
 */
export function getAssetUrl(
  entry: ArticleIndexEntry,
  reference: string,
): string {
  return resolveAssetUrl(corpus, entry, reference);
}

/** The excerpt as plain text, whole: markdown marks dropped, their text kept, lines and paragraphs joined by one space. */
export function getExcerptText(entry: ArticleIndexEntry): string {
  return plainText(remark().parse(entry.excerpt)).replace(/\s+/g, ' ').trim();
}

function plainText(node: Nodes): string {
  if (node.type === 'text' || node.type === 'inlineCode') {
    return node.value;
  }
  if (node.type === 'break') {
    return ' ';
  }
  if (!('children' in node)) {
    return '';
  }
  // Blocks are joined by a space, the inline nodes of one block by nothing.
  const separator = BLOCK_CONTAINERS.has(node.type) ? ' ' : '';
  return node.children.map((child) => plainText(child)).join(separator);
}

const BLOCK_CONTAINERS = new Set(['root', 'blockquote', 'list', 'listItem']);
