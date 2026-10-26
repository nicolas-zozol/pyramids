import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

/**
 * Corpora are written to a fresh temporary directory rather than committed as
 * files, for three reasons that all matter here: the entries AC-CONTENTSOURCE-05
 * names include a `.DS_Store`, which the repository's `.gitignore` would drop
 * from a clean checkout; each corpus gets a root no other test shares, so the
 * per-process memo of `readCorpus` cannot leak one test's read into another's;
 * and the corpus a test reads is written in the test, where a reader can see it.
 */

interface ArticleOptions {
  /** The opening block, before the `---` separator. `null` writes no separator at all. */
  excerpt?: string | null;
  body?: string;
}

/** Raw YAML rather than a value map: a schema test must show the frontmatter it feeds. */
export function article(yaml: string, options: ArticleOptions = {}): string {
  const { excerpt = 'The opening block of the article.', body = 'The body.' } =
    options;

  const front = `---\n${yaml.trim()}\n---\n`;
  return excerpt === null ? `${front}\n${body}\n` : `${front}\n${excerpt}\n\n---\n\n${body}\n`;
}

/** Writes the files under a fresh root and returns that root, absolute. */
export async function writeCorpus(
  files: Record<string, string>,
): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'pyramids-content-'));
  await writeInto(root, files);
  return root;
}

/**
 * Writes a corpus root beside a neighbour directory, so a test can prove the
 * traversal descends into the first and never touches the second
 * (AC-CONTENTSOURCE-04).
 */
export async function writeNeighbourhood(files: {
  corpus: Record<string, string>;
  elsewhere: Record<string, string>;
}): Promise<{ root: string; neighbour: string }> {
  const parent = await mkdtemp(join(tmpdir(), 'pyramids-content-'));
  const root = join(parent, 'corpus');
  const neighbour = join(parent, 'elsewhere');

  await writeInto(root, files.corpus);
  await writeInto(neighbour, files.elsewhere);

  return { root, neighbour };
}

async function writeInto(
  root: string,
  files: Record<string, string>,
): Promise<void> {
  await mkdir(root, { recursive: true });
  for (const [path, contents] of Object.entries(files)) {
    const target = join(root, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, contents, 'utf8');
  }
}
