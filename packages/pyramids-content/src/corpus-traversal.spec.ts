import { readFile, readdir } from 'node:fs/promises';
import { sep } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { article, writeCorpus, writeNeighbourhood } from '../test/corpus-fixture.js';
import type { CorpusSpec } from './contract.js';
import { readCorpus } from './read-corpus.js';

/**
 * The two defects the v1 measurement found, turned into tests.
 *
 * v1 opens its reader with `traverseDir('', …)` over the whole working
 * directory — 8,024 files for an empty callback body — and raises
 * `postsGenerated = true` before the parsing it guards has completed, so a
 * concurrent second caller receives a partially-filled array. Neither shape may
 * appear here (R-CONTENTSOURCE-03 and 04).
 */
vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual<typeof import('node:fs/promises')>(
    'node:fs/promises',
  );
  return { ...actual, readdir: vi.fn(actual.readdir), readFile: vi.fn(actual.readFile) };
});

function spec(root: string): CorpusSpec {
  return { root, localeFrom: 'frontmatter' };
}

function published(title: string, date: string): string {
  return article(`title: '${title}'\nlocale: 'en'\ndate: '${date}'\npublished: true`);
}

const THREE_ARTICLES = {
  'a.md': published('A', '2021-01-01'),
  'b.md': published('B', '2021-01-02'),
  'c.md': published('C', '2021-01-03'),
};

/** Every path the reader handed to the filesystem, in the order it did. */
function touchedPaths(): string[] {
  return [...vi.mocked(readdir).mock.calls, ...vi.mocked(readFile).mock.calls].map(
    (call) => String(call[0]),
  );
}

describe('the traversal', () => {
  let log: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    log = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    log.mockRestore();
  });

  it('reads a corpus once per process, and two callers arriving first both get the whole of it', async () => {
    const corpus = spec(await writeCorpus(THREE_ARTICLES));
    vi.mocked(readdir).mockClear();

    const [first, second] = await Promise.all([
      readCorpus(corpus),
      readCorpus(corpus),
    ]);

    expect(vi.mocked(readdir)).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
    expect(first.articles).toHaveLength(3);
    expect(second.articles).toHaveLength(3);
  });

  it('serves a caller arriving after the read from the same result', async () => {
    const corpus = spec(await writeCorpus(THREE_ARTICLES));
    vi.mocked(readdir).mockClear();

    const first = await readCorpus(corpus);
    const later = await readCorpus(corpus);

    expect(vi.mocked(readdir)).toHaveBeenCalledTimes(1);
    expect(later).toBe(first);
  });

  it('memoizes on the resolved root, so two specs of one tree share one read', async () => {
    const root = await writeCorpus(THREE_ARTICLES);
    vi.mocked(readdir).mockClear();

    const first = await readCorpus({ root, localeFrom: 'frontmatter' });
    const again = await readCorpus({ root: `${root}${sep}.`, localeFrom: 'frontmatter' });

    expect(vi.mocked(readdir)).toHaveBeenCalledTimes(1);
    expect(again).toBe(first);
  });

  it('makes the traversal visible in the build output, once', async () => {
    const corpus = spec(await writeCorpus(THREE_ARTICLES));

    await readCorpus(corpus);
    await readCorpus(corpus);

    const traversals = log.mock.calls
      .map((call) => String(call[0]))
      .filter((line) => line.includes(corpus.root));
    expect(traversals).toHaveLength(1);
    expect(traversals[0]).toContain('3 published');
  });

  it('names the files left out for want of `published: true` in that same output', async () => {
    const corpus = spec(
      await writeCorpus({
        ...THREE_ARTICLES,
        'silent.md': article(`title: 'Silent'\nlocale: 'en'\ndate: '2021-01-04'`),
      }),
    );

    await readCorpus(corpus);

    const output = log.mock.calls.map((call) => String(call[0])).join('\n');
    expect(output).toContain('silent.md');
  });

  it('descends inside the declared root and enumerates nothing above it', async () => {
    const { root, neighbour } = await writeNeighbourhood({
      corpus: THREE_ARTICLES,
      elsewhere: Object.fromEntries(
        Array.from({ length: 50 }, (_, i) => [`noise-${i}.md`, published(`N${i}`, '2020-01-01')]),
      ),
    });
    vi.clearAllMocks();

    const read = await readCorpus(spec(root));

    expect(read.articles).toHaveLength(3);
    expect(vi.mocked(readdir)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(readdir).mock.calls[0][0]).toBe(root);
    expect(vi.mocked(readdir).mock.calls[0][1]).toMatchObject({ recursive: true });

    const outside = touchedPaths().filter(
      (path) => path !== root && !path.startsWith(`${root}${sep}`),
    );
    expect(outside).toEqual([]);
    expect(touchedPaths().some((path) => path.startsWith(neighbour))).toBe(false);
  });

  it('keeps a failed read memoized rather than retrying it on every caller', async () => {
    const corpus = spec(`${await writeCorpus({})}${sep}absent`);
    vi.mocked(readdir).mockClear();

    const first = await readCorpus(corpus);
    const second = await readCorpus(corpus);

    expect(vi.mocked(readdir)).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
    expect(first.violations[0].code).toBe('missing-corpus-root');
  });
});
