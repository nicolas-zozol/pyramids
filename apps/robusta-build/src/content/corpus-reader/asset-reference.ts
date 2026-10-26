import { posix } from 'node:path';
import type { ArticleEntry, CorpusSpec } from './contract.js';

/**
 * The one resolution rule, shared by what the site publishes and what a page
 * links to: an article-relative reference is joined onto the article's own
 * directory inside the corpus and normalised. The URL an image is served at is
 * therefore derived from the file's place in the corpus, never from the page's
 * place in the URL scheme (R-MIGRATELEARN-22) — which is what lets an article
 * change category without moving a single image, and what stops the drift v1's
 * hand-kept `public/learn/**` mirror is living proof of.
 *
 * A leaf module: `read-file-entry.ts` validates references through it while
 * `copy-corpus-assets.ts` publishes files through it, and neither reaches the
 * other.
 */

/** Markdown image syntax, and the raw `<img>` an author may drop into a body. */
const MARKDOWN_IMAGE = /!\[[^\]]*\]\(\s*<?([^>\s)]+)>?/g;
const HTML_IMAGE = /<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi;

/** A scheme, a protocol-relative host or a site-absolute path: not the corpus's to answer. */
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/)/i;

export function isExternalReference(reference: string): boolean {
  return EXTERNAL.test(reference);
}

/**
 * Every image reference a file carries, in the order it carries them, once each.
 * The cover comes from the frontmatter and the rest from the body, and both are
 * validated: a broken cover is a broken image like any other.
 */
export function assetReferences(
  image: string | undefined,
  body: string,
): string[] {
  const found = image === undefined ? [] : [image];

  for (const pattern of [MARKDOWN_IMAGE, HTML_IMAGE]) {
    for (const match of body.matchAll(pattern)) {
      found.push(match[1]);
    }
  }

  return [...new Set(found)];
}

/**
 * The corpus-relative path a reference names, or `undefined` when the corpus
 * does not answer for it — an external or absolute reference, and a relative one
 * escaping the root. The caller decides what that means: a violation when
 * validating, a file not to publish when copying.
 */
export function corpusAssetPath(
  articlePath: string,
  reference: string,
): string | undefined {
  if (isExternalReference(reference)) {
    return undefined;
  }

  const resolved = posix.normalize(
    posix.join(posix.dirname(articlePath), reference),
  );

  return resolved.startsWith('../') || resolved === '..' ? undefined : resolved;
}

/**
 * The URL an article-relative reference resolves to; absolute and external pass
 * through, as does everything when the site declares no asset root.
 */
export function resolveAssetUrl(
  corpus: CorpusSpec,
  entry: ArticleEntry,
  reference: string,
): string {
  const path = corpusAssetPath(entry.path, reference);
  if (corpus.assets === undefined || path === undefined) {
    return reference;
  }
  return `${corpus.assets.urlPrefix}/${path}`;
}
