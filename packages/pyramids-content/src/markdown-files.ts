import { readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const MARKDOWN = '.md';

/**
 * The declared root, and nothing above it (R-CONTENTSOURCE-04). One `readdir`
 * with `recursive: true` descends inside the corpus; no path outside it is
 * enumerated, stated or read.
 *
 * A file is an article by an explicit rule (R-CONTENTSOURCE-05): it is a file,
 * its name ends in `.md`, and its path matches none of the suffixes the corpus
 * excludes. A directory named `draft.md` is a directory, and `notes.md.bak` is
 * not markdown.
 *
 * Throws when the root does not exist. The caller turns that into a violation,
 * because the reading contract never throws on content.
 */
export async function markdownFiles(
  root: string,
  exclude: readonly string[],
): Promise<string[]> {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => corpusPath(root, join(entry.parentPath, entry.name)))
    .filter((path) => path.endsWith(MARKDOWN))
    .filter((path) => !exclude.some((suffix) => path.endsWith(suffix)))
    .sort();
}

/** Relative to the corpus root and slash-separated: the path a build failure prints. */
function corpusPath(root: string, file: string): string {
  return relative(root, file).split(sep).join('/');
}
