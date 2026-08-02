import {
  describeViolation,
  readArticleBody,
  readCorpus,
  resolveAssetUrl,
  type ArticleBody,
  type ArticleEntry,
} from '@robusta/pyramids-content';
import { corpus } from './corpus.js';

/**
 * The seam `seo-url-scheme` left and `content-source` implemented. The name the
 * route table imports does not move; the type has one definition, in the base.
 *
 * The entry deliberately carries no article body: answering what articles exist
 * must never cost a render (R-CONTENTSOURCE-06). What it carries is what a
 * listing can show without opening a body — a title, a date, an excerpt, an
 * image, the categories and tags related articles are chosen on.
 *
 * Called from `generateStaticParams`, from page bodies at build time and from
 * `scripts/emit-redirects.mjs`, and from nothing else (BR-PYRAMID-7).
 */
export type ArticleIndexEntry = ArticleEntry;

/**
 * The single place a corpus violation becomes fatal (R-CONTENTSOURCE-47).
 * `readCorpus` returns violations and never throws; every consumer passes
 * through here, `emit-redirects.mjs` included, so a corpus that breaks the
 * schema fails `yarn emit:redirects` before `next build` starts — the earliest
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
