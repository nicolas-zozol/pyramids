import { describe, expect, it } from 'vitest';
import type { ArticleIndexEntry } from './article-index.ts';
import { getArticleIndex, getExcerptText } from './article-index.ts';

const entry = (excerpt: string): ArticleIndexEntry => ({
  path: 'web/fixture.md',
  slug: 'fixture',
  locale: 'en',
  title: 'A fixture',
  date: '2024-03-05',
  author: 'Nina',
  tags: [],
  excerpt,
});

// R-SEOEXCELLENCE-02: an article's description is its excerpt, whole, in plain text.
describe('getExcerptText', () => {
  it('drops the emphasis, link and code marks of the excerpt and keeps their text', () => {
    expect(
      getExcerptText(
        entry(
          'Leaving **Gmail** is _easy_ with [a good host](https://example.com) and `imap`.',
        ),
      ),
    ).toBe('Leaving Gmail is easy with a good host and imap.');
  });

  it('keeps the excerpt whole, its lines and paragraphs joined by one space', () => {
    expect(
      getExcerptText(
        entry('A first line\na second line.\n\nA second paragraph.'),
      ),
    ).toBe('A first line a second line. A second paragraph.');
  });

  it('leaves a plain excerpt as written', () => {
    expect(getExcerptText(entry('GMail was a revolution in 2004.'))).toBe(
      'GMail was a revolution in 2004.',
    );
  });

  it('gives every article of the corpus a description of its own, with no markdown mark left', async () => {
    const texts = (await getArticleIndex()).map(getExcerptText);

    expect(new Set(texts).size).toBe(texts.length);
    for (const text of texts) {
      expect(text).not.toMatch(/\*\*|\]\(|^#|`/);
      expect(text.length).toBeGreaterThan(0);
    }
  });
});
