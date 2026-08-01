import { readFile, readdir } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { corpus } from './corpus.js';

/**
 * The freeze between the two corpora, and the proof the conversion lost nothing.
 *
 * The eleven articles were copied rather than moved, so `apps/robusta` keeps
 * rendering the tree it reads and `yarn build:robusta` keeps producing its 42
 * pages (R-MIGRATELEARN-01 and 81). What stops two copies of one corpus
 * diverging is this comparison: it walks the eleven pairs and holds the markdown
 * body — everything after the closing frontmatter delimiter — byte for byte
 * (R-MIGRATELEARN-02 and 03).
 *
 * Two things it deliberately does not do, worth saying plainly:
 *
 * - Frontmatter is excluded, diverging frontmatter being the whole point of the
 *   conversion. A publisher editing the title of a v1 article breaks nothing that
 *   turns red; the freeze on frontmatter rests on discipline and on
 *   `retire-robusta-v1` deleting the tree.
 * - It reaches into another app, which the corpus spec beside it now stops doing.
 *   That asymmetry is the point: a freeze between two trees cannot live in one of
 *   them alone. It dies with the v1 tree, in the commit that deletes
 *   `apps/robusta/content/blog`, which is why it is its own file.
 */

const V2 = resolve(process.cwd(), corpus.root);
const V1 = resolve(process.cwd(), '../robusta/content/blog');

/** Everything after the closing `---` of the frontmatter, delimiter included. */
function body(raw: string): string {
  const close = raw.indexOf('\n---', 3);
  if (!raw.startsWith('---\n') || close === -1) {
    throw new Error('the file carries no frontmatter block to cut at');
  }
  return raw.slice(close + 1);
}

async function articlesUnder(root: string): Promise<string[]> {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) =>
      relative(root, join(entry.parentPath, entry.name)).split(sep).join('/'),
    )
    .sort();
}

const pairs = await articlesUnder(V2);

describe('the frozen v1 corpus and its conversion', () => {
  it('holds the same eleven articles at the same relative paths', async () => {
    expect(pairs).toHaveLength(11);
    expect(await articlesUnder(V1)).toEqual(pairs);
  });

  for (const path of pairs) {
    it(`carries the body of ${path} byte for byte`, async () => {
      const [v1, v2] = await Promise.all([
        readFile(join(V1, path), 'utf8'),
        readFile(join(V2, path), 'utf8'),
      ]);

      expect(body(v2)).toBe(body(v1));
    });
  }

  it('differs from it in the frontmatter, which is what the conversion is', async () => {
    const converted = join('blockchain', 'yield-farming.md');
    const [v1, v2] = await Promise.all([
      readFile(join(V1, converted), 'utf8'),
      readFile(join(V2, converted), 'utf8'),
    ]);

    expect(v2).not.toBe(v1);
    expect(v1).toContain('categoryPath: blockchain');
    expect(v2).toContain('category: blockchain');
  });
});
