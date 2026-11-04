import { resolve } from 'node:path';
import type {
  ArticleEntry,
  CorpusRead,
  CorpusSpec,
  CorpusViolation,
  TranslationNotice,
} from './contract.ts';
import { markdownFiles } from './markdown-files.ts';
import {
  readFileEntry,
  type FileRead,
  type IndexedArticle,
} from './read-file-entry.ts';
import { translationNotices } from './translation-notices.ts';

/**
 * One traversal per corpus root per process (R-CONTENTSOURCE-03). The map holds
 * the promise, never a flag raised ahead of the work it guards: a second caller
 * arriving before the first read resolves awaits that same promise and receives
 * the same complete result. v1 sets `postsGenerated = true` before its parsing
 * completes, which is how a concurrent caller there gets a partially-filled
 * array.
 *
 * A rejected read stays memoized. A corpus that fails to read fails the build,
 * and reading it a second time would only produce the same failure twice.
 *
 * The key is the resolved root, so two specs of one tree share one read. The
 * memo is per process, which under `next build` means one per static-generation
 * worker: forked workers share no memory, and the traversal count follows the
 * worker count.
 */
const reads = new Map<string, Promise<CorpusRead>>();

/** The published articles, violations and translation notices of a corpus, frozen and read once per resolved root and process. */
export function readCorpus(corpus: CorpusSpec): Promise<CorpusRead> {
  const root = resolve(process.cwd(), corpus.root);

  const inFlight = reads.get(root);
  if (inFlight !== undefined) {
    return inFlight;
  }

  const read = traverse(root, corpus);
  reads.set(root, read);
  return read;
}

async function traverse(root: string, corpus: CorpusSpec): Promise<CorpusRead> {
  let paths: string[];
  try {
    paths = await markdownFiles(root, corpus.exclude ?? []);
  } catch (error) {
    if (!isMissingDirectory(error)) {
      throw error;
    }
    // A root that does not exist is a violation like a missing title, so the
    // caller has one failure path instead of two (R-CONTENTSOURCE-48).
    return report(
      root,
      seal([], [{ code: 'missing-corpus-root', root }], [], []),
    );
  }

  const files = await Promise.all(
    paths.map((path) => readFileEntry(root, path, corpus)),
  );

  const indexed = published(files);
  const articles = indexed.map((article) => article.entry).sort(newestFirst);
  const unpublished = files.filter((file) => !file.published).map((file) => file.path);
  const violations = [
    ...files.flatMap((file) => file.violations),
    ...duplicateTranslationIds(articles),
  ];

  return report(
    root,
    seal(articles, violations, translationNotices(indexed), unpublished),
  );
}

function published(files: readonly FileRead[]): IndexedArticle[] {
  return files.flatMap((file) =>
    file.published && file.article !== undefined ? [file.article] : [],
  );
}

/** Newest first, then by path, so one corpus always produces one list. */
function newestFirst(a: ArticleEntry, b: ArticleEntry): number {
  if (a.date !== b.date) {
    return a.date < b.date ? 1 : -1;
  }
  return a.path < b.path ? -1 : a.path > b.path ? 1 : 0;
}

/**
 * A translation identifier is shared by the locale versions of one article, so
 * two published articles of one locale carrying the same one is a misuse
 * (R-CONTENTSOURCE-44). Both files are named: neither is more at fault.
 */
function duplicateTranslationIds(
  articles: readonly ArticleEntry[],
): CorpusViolation[] {
  const groups = new Map<string, ArticleEntry[]>();

  for (const article of articles) {
    if (article.translationId === undefined) {
      continue;
    }
    const key = `${article.locale}\u0000${article.translationId}`;
    groups.set(key, [...(groups.get(key) ?? []), article]);
  }

  return [...groups.values()]
    .filter((group) => group.length > 1)
    .flatMap((group) =>
      [...group]
        .sort((a, b) => (a.path < b.path ? -1 : 1))
        .map((article) => ({
          code: 'duplicate-translation-id' as const,
          path: article.path,
          translationId: article.translationId as string,
          locale: article.locale,
        })),
    );
}

/**
 * The list a caller receives cannot be mutated by that caller
 * (R-CONTENTSOURCE-07). Every caller shares the memoized read, and v1's third
 * defect — a shared array any caller could sort in place — has no place to
 * occur here.
 */
function seal(
  articles: ArticleEntry[],
  violations: CorpusViolation[],
  notices: TranslationNotice[],
  unpublished: string[],
): CorpusRead {
  for (const article of articles) {
    Object.freeze(article.tags);
    if (article.original !== undefined) {
      Object.freeze(article.original);
    }
    Object.freeze(article);
  }
  for (const notice of notices) {
    if (notice.code === 'untracked-pair') {
      Object.freeze(notice.versions);
    }
    Object.freeze(notice);
  }
  return Object.freeze({
    articles: Object.freeze(articles),
    violations: Object.freeze(violations),
    translationNotices: Object.freeze(notices),
    unpublished: Object.freeze(unpublished),
  });
}

/**
 * The traversal count is a build-output fact, not an inference
 * (AC-CONTENTSOURCE-02), and the files left out for want of `published: true`
 * are named where the publisher will see them (AC-CONTENTSOURCE-42).
 */
function report(root: string, read: CorpusRead): CorpusRead {
  console.log(
    `[pyramids-content] ${root}: ${read.articles.length} published, ${read.unpublished.length} unpublished, ${read.violations.length} violations — one traversal in process ${process.pid}`,
  );
  if (read.unpublished.length > 0) {
    console.log(
      `[pyramids-content] left out for want of \`published: true\`: ${read.unpublished.join(', ')}`,
    );
  }
  return read;
}

function isMissingDirectory(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException | undefined)?.code;
  return code === 'ENOENT' || code === 'ENOTDIR';
}
