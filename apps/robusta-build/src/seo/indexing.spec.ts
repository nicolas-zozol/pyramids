import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ArticleIndexEntry } from '../content/article-index.ts';
import { INDEXING_OPEN, isIndexable, robotsOf } from './index.ts';

const article = (
  slug: string,
  locale: string,
  category?: string,
): ArticleIndexEntry => ({
  path: `${slug}.md`,
  slug,
  locale,
  ...(category === undefined ? {} : { category }),
  title: slug,
  date: '2022-01-01',
  author: 'Nina',
  tags: [],
  excerpt: 'An excerpt.',
});

// R-SEOEXCELLENCE-23 and 25: closed until go-live, by one constant.
describe('robotsOf', () => {
  it('closes every page in a build that is not the Netlify production one, as the specs run', () => {
    expect(INDEXING_OPEN).toBe(false);
    expect(robotsOf(true)).toBe('noindex, nofollow');
    expect(robotsOf(false)).toBe('noindex, nofollow');
  });

  it('opens an indexable page only once indexing is open', () => {
    expect(robotsOf(true, true)).toBe('index, follow');
    expect(robotsOf(false, true)).toBe('noindex, nofollow');
  });

  it('is decided by INDEXING_OPEN alone, written once in src/seo', async () => {
    const src = resolve(process.cwd(), 'src');
    const entries = await readdir(src, {
      recursive: true,
      withFileTypes: true,
    });
    const sources = entries.filter(
      (entry) =>
        entry.isFile() &&
        /\.tsx?$/.test(entry.name) &&
        !/\.spec\./.test(entry.name),
    );
    const writers: string[] = [];
    for (const entry of sources) {
      const text = await readFile(join(entry.parentPath, entry.name), 'utf8');
      if (/INDEXING_OPEN\s*(:\s*boolean\s*)?=/.test(text))
        writers.push(entry.name);
    }

    expect(writers).toEqual(['indexing.ts']);
  });
});

/** INDEXING_OPEN as a fresh load of its module reads it, under the given build variables. */
async function indexingOpenUnder(
  env: Partial<Record<'NETLIFY' | 'NETLIFY_LOCAL' | 'CONTEXT', string>>,
): Promise<boolean> {
  for (const name of ['NETLIFY', 'NETLIFY_LOCAL', 'CONTEXT'] as const)
    vi.stubEnv(name, env[name]);
  vi.resetModules();
  const indexing = await import('./indexing.ts');
  return indexing.INDEXING_OPEN;
}

// R-GOLIVE-01, R-GOLIVE-05: open on the production build run by Netlify only.
describe('INDEXING_OPEN', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('is open on a production build run by Netlify', async () => {
    expect(
      await indexingOpenUnder({ NETLIFY: 'true', CONTEXT: 'production' }),
    ).toBe(true);
  });

  it('stays closed on a build without NETLIFY nor CONTEXT, a local build', async () => {
    expect(await indexingOpenUnder({})).toBe(false);
  });

  it('stays closed on Netlify outside production: branch deploy, deploy preview, dev', async () => {
    for (const CONTEXT of ['branch-deploy', 'deploy-preview', 'dev'])
      expect(
        await indexingOpenUnder({ NETLIFY: 'true', CONTEXT }),
        CONTEXT,
      ).toBe(false);
  });

  it('stays closed on a build of the Netlify CLI, CONTEXT production without NETLIFY', async () => {
    expect(
      await indexingOpenUnder({ NETLIFY_LOCAL: 'true', CONTEXT: 'production' }),
    ).toBe(false);
  });

  it('opens an indexable page only, once open', async () => {
    vi.stubEnv('NETLIFY', 'true');
    vi.stubEnv('CONTEXT', 'production');
    vi.resetModules();
    const indexing = await import('./indexing.ts');

    expect(indexing.robotsOf(true)).toBe('index, follow');
    expect(indexing.robotsOf(false)).toBe('noindex, nofollow');
  });

  it('is the only reader of NETLIFY and CONTEXT under src', async () => {
    const src = resolve(process.cwd(), 'src');
    const entries = await readdir(src, {
      recursive: true,
      withFileTypes: true,
    });
    const readers: string[] = [];
    for (const entry of entries) {
      if (
        !entry.isFile() ||
        !/\.tsx?$/.test(entry.name) ||
        /\.spec\./.test(entry.name)
      )
        continue;
      const text = await readFile(join(entry.parentPath, entry.name), 'utf8');
      if (/process\.env\.(NETLIFY|CONTEXT)\b/.test(text))
        readers.push(entry.name);
    }

    expect(readers).toEqual(['indexing.ts']);
  });
});

// R-SEOEXCELLENCE-21: the one rule of indexability.
describe('isIndexable', () => {
  const index = [
    article('leaving-gmail', 'en', 'privacy'),
    article('quel-second-langage', 'fr', 'theory'),
  ];

  it('accepts every landing page and every article page', () => {
    for (const locale of ['en', 'fr', 'es'])
      expect(isIndexable({ kind: 'landing', locale }, index)).toBe(true);
    expect(
      isIndexable(
        {
          kind: 'article',
          locale: 'en',
          category: 'privacy',
          slug: 'leaving-gmail',
        },
        index,
      ),
    ).toBe(true);
  });

  it('accepts a roll page that lists an article, a Category of one article included', () => {
    expect(
      isIndexable({ kind: 'blog-home', locale: 'fr', page: 1 }, index),
    ).toBe(true);
    expect(
      isIndexable(
        { kind: 'category', locale: 'en', category: 'privacy', page: 1 },
        index,
      ),
    ).toBe(true);
  });

  it('refuses a roll page listing nothing, an empty en blog home included, and every tag page', () => {
    expect(
      isIndexable({ kind: 'blog-home', locale: 'en', page: 1 }, [index[1]]),
    ).toBe(false);
    expect(
      isIndexable({ kind: 'blog-home', locale: 'en', page: 2 }, index),
    ).toBe(false);
    expect(
      isIndexable({ kind: 'tag', locale: 'en', tag: 'web', page: 1 }, index),
    ).toBe(false);
  });
});

describe('the seo package', () => {
  it('imports neither React, nor a value of the Site configuration, nor page-data, so Node runs it compiled', async () => {
    const directory = resolve(process.cwd(), 'src/seo');
    const files = (await readdir(directory)).filter(
      (name) => name.endsWith('.ts') && !name.endsWith('.spec.ts'),
    );
    for (const name of files) {
      const text = await readFile(join(directory, name), 'utf8');
      expect(text, name).not.toMatch(/from ['"]react/);
      expect(text, name).not.toMatch(
        /^import \{[^}]*\} from ['"][^'"]*seopyramids\.config/m,
      );
      expect(text, name).not.toMatch(/page-data/);
    }
  });
});
