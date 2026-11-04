import { readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
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
  it('closes every page while INDEXING_OPEN is false, the constant of this story', () => {
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
