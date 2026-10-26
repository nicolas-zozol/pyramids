import { copyFile, mkdir, readFile, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import matter from 'gray-matter';
import { assetReferences, corpusAssetPath } from './asset-reference.js';
import type { ArticleEntry, CorpusSpec } from './contract.js';
import { readCorpus } from './read-corpus.js';

/**
 * Mirrors into `assets.publishDir` the files the published articles reference,
 * at their corpus-relative paths. Returns those paths, for the caller to log.
 *
 * The corpus is not under `public/`, and a site must not read its content source
 * while serving a request (BR-PYRAMID-7), so the referenced files become
 * ordinary static files before `next build` starts.
 *
 * The step owns the directory it writes and removes it first
 * (R-MIGRATELEARN-28): the tree is produced in full on every run, so a renamed,
 * re-pathed or deleted image cannot survive as a stale public file. It reads
 * only the corpus and depends on no committed artefact, so it produces a correct
 * tree on a checkout carrying none (R-MIGRATELEARN-29) — including the empty one
 * a corpus referencing nothing deserves, so what the directory holds is always
 * what the corpus says and never what a previous run left.
 *
 * Only what the published articles reference travels (R-MIGRATELEARN-21), which
 * keeps an unpublished article's images out of the served site.
 */
export async function copyCorpusAssets(
  corpus: CorpusSpec,
): Promise<readonly string[]> {
  if (corpus.assets === undefined) {
    return [];
  }

  const root = resolve(process.cwd(), corpus.root);
  const publishDir = resolve(process.cwd(), corpus.assets.publishDir);
  const { articles } = await readCorpus(corpus);
  const paths = await referencedPaths(root, articles);

  await rm(publishDir, { recursive: true, force: true });
  await mkdir(publishDir, { recursive: true });
  for (const path of paths) {
    const target = join(publishDir, path);
    await mkdir(dirname(target), { recursive: true });
    await copyFile(join(root, path), target);
  }

  return paths;
}

/**
 * The same set validation computed, read a second time from the files. One
 * corpus-relative path however many articles reference it, in the order the
 * index carries them, so two runs over one corpus produce one list.
 */
async function referencedPaths(
  root: string,
  articles: readonly ArticleEntry[],
): Promise<string[]> {
  const paths = new Set<string>();

  for (const entry of articles) {
    const { content } = matter(await readFile(join(root, entry.path), 'utf8'));
    for (const reference of assetReferences(entry.image, content)) {
      const path = corpusAssetPath(entry.path, reference);
      if (path !== undefined) {
        paths.add(path);
      }
    }
  }

  return [...paths];
}
