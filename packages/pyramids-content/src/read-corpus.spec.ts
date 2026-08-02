import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { describe, expect, it } from 'vitest';
import { article, writeCorpus } from '../test/corpus-fixture.js';
import type { ArticleEntry, CorpusSpec } from './contract.js';
import { readArticleBody } from './read-article-body.js';
import { readCorpus } from './read-corpus.js';

function spec(root: string, rest: Partial<CorpusSpec> = {}): CorpusSpec {
  return { root, localeFrom: 'frontmatter', ...rest };
}

const PUBLISHED_EN = `
title: 'Ledger versus Metamask'
locale: 'en'
date: '2022-01-20'
category: blockchain
tags: ['blockchain', 'security']
image: ./images/ledger.png
author: 'Nina'
published: true
`;

describe('readCorpus — the index', () => {
  it('carries every published article once, with the fields of ArticleEntry', async () => {
    const root = await writeCorpus({
      'blockchain/ledger.md': article(PUBLISHED_EN),
    });

    const { articles } = await readCorpus(spec(root));

    expect(articles).toHaveLength(1);
    expect(articles[0]).toEqual({
      path: 'blockchain/ledger.md',
      slug: 'ledger-versus-metamask',
      locale: 'en',
      category: 'blockchain',
      title: 'Ledger versus Metamask',
      date: '2022-01-20',
      author: 'Nina',
      tags: ['blockchain', 'security'],
      excerpt: 'The opening block of the article.',
      image: './images/ledger.png',
    });
  });

  it('orders the articles newest first', async () => {
    const root = await writeCorpus({
      'old.md': article(
        `title: 'Old'\nlocale: 'en'\ndate: '2019-05-24'\nauthor: 'Nina'\npublished: true`,
      ),
      'new.md': article(
        `title: 'New'\nlocale: 'en'\ndate: '2022-01-20'\nauthor: 'Nina'\npublished: true`,
      ),
      'middle.md': article(
        `title: 'Middle'\nlocale: 'en'\ndate: '2021-01-04'\nauthor: 'Nina'\npublished: true`,
      ),
    });

    const { articles } = await readCorpus(spec(root));

    expect(articles.map((entry) => entry.title)).toEqual([
      'New',
      'Middle',
      'Old',
    ]);
  });

  it('orders articles of one date by their path, so the index is the same list twice', async () => {
    const root = await writeCorpus({
      'b.md': article(
        `title: 'B'\nlocale: 'en'\ndate: '2021-11-30'\nauthor: 'Nina'\npublished: true`,
      ),
      'a.md': article(
        `title: 'A'\nlocale: 'en'\ndate: '2021-11-30'\nauthor: 'Nina'\npublished: true`,
      ),
    });

    const { articles } = await readCorpus(spec(root));

    expect(articles.map((entry) => entry.path)).toEqual(['a.md', 'b.md']);
  });

  it('names the source file of every article it returns', async () => {
    const root = await writeCorpus({
      'blockchain/ledger-versus-metamask.md': article(PUBLISHED_EN),
    });

    const { articles } = await readCorpus(spec(root));

    expect(articles[0].path).toBe('blockchain/ledger-versus-metamask.md');
  });

  it('renders no article body to answer what articles exist', async () => {
    const root = await writeCorpus({
      'a.md': article(
        `title: 'A'\nlocale: 'en'\ndate: '2021-01-01'\nauthor: 'Nina'\npublished: true`,
        {
          body: 'A paragraph carrying the word deoxyribonucleic.',
        },
      ),
    });
    const corpus = spec(root);

    const read = await readCorpus(corpus);

    expect(JSON.stringify(read)).not.toContain('deoxyribonucleic');
    expect((await readArticleBody(corpus, read.articles[0])).html).toContain(
      'deoxyribonucleic',
    );
  });

  it('hands out a list the caller cannot mutate', async () => {
    const root = await writeCorpus({
      'a.md': article(
        `title: 'A'\nlocale: 'en'\ndate: '2021-01-01'\nauthor: 'Nina'\npublished: true`,
      ),
      'b.md': article(
        `title: 'B'\nlocale: 'en'\ndate: '2021-01-02'\nauthor: 'Nina'\npublished: true`,
      ),
    });

    const { articles } = await readCorpus(spec(root));

    expect(() => (articles as ArticleEntry[]).push(articles[0])).toThrow();
    expect(() => (articles as ArticleEntry[]).sort()).toThrow();
  });
});

describe('readCorpus — what makes a file an article', () => {
  it('reads `.md` files and leaves everything else alone', async () => {
    const root = await writeCorpus({
      'real.md': article(
        `title: 'Real'\nlocale: 'en'\ndate: '2021-01-01'\nauthor: 'Nina'\npublished: true`,
      ),
      'notes.md.bak': 'not markdown at all',
      'draft.md/inside.txt': 'a directory whose name ends in .md',
      '.DS_Store': 'macOS',
      'example.md': article(
        `title: 'Example'\nlocale: 'en'\ndate: '2021-01-01'`,
      ),
    });

    const read = await readCorpus(spec(root, { exclude: ['example.md'] }));

    expect(read.violations).toEqual([]);
    expect(read.articles.map((entry) => entry.path)).toEqual(['real.md']);
    expect(read.unpublished).toEqual([]);
  });

  it('takes the category from the frontmatter and never from the folder', async () => {
    const root = await writeCorpus({
      'javascript/typescript/completes-with.md': article(
        `title: 'Completing a RxJs Observable with another'\nlocale: 'en'\ndate: '2021-05-23'\ncategory: typescript\nauthor: 'Nina'\npublished: true`,
      ),
    });

    const { articles, violations } = await readCorpus(spec(root));

    expect(violations).toEqual([]);
    expect(articles[0].category).toBe('typescript');
  });

  it('uses the slug the frontmatter pins, and derives one when it does not', async () => {
    const root = await writeCorpus({
      'pinned.md': article(
        `title: 'A title nobody addresses'\nlocale: 'en'\ndate: '2021-01-01'\nslug: pinned-by-hand\nauthor: 'Nina'\npublished: true`,
      ),
      'derived.md': article(
        `title: 'A title nobody addresses either'\nlocale: 'en'\ndate: '2021-01-02'\nauthor: 'Nina'\npublished: true`,
      ),
    });

    const { articles } = await readCorpus(spec(root));
    const bySlug = Object.fromEntries(articles.map((e) => [e.path, e.slug]));

    expect(bySlug['pinned.md']).toBe('pinned-by-hand');
    expect(bySlug['derived.md']).toBe('a-title-nobody-addresses-either');
  });

  it('ignores the fields the schema does not name', async () => {
    const root = await writeCorpus({
      'a.md': article(
        `title: 'A'\nlocale: 'en'\ndate: '2021-01-01'\npublished: true\nauthor: Nicolas Zozol\nfeatured: true\nkeywords: ['freelance']`,
      ),
    });

    const { articles } = await readCorpus(spec(root));

    expect(Object.keys(articles[0]).sort()).toEqual([
      'author',
      'date',
      'excerpt',
      'locale',
      'path',
      'slug',
      'tags',
      'title',
    ]);
  });
});

describe('readCorpus — published', () => {
  it('carries an article only when it declares itself published', async () => {
    const root = await writeCorpus({
      'yes.md': article(
        `title: 'Yes'\nlocale: 'en'\ndate: '2021-01-01'\nauthor: 'Nina'\npublished: true`,
      ),
      'silent.md': article(
        `title: 'Silent'\nlocale: 'en'\ndate: '2021-01-02'\nauthor: 'Nina'`,
      ),
      'no.md': article(
        `title: 'No'\nlocale: 'en'\ndate: '2021-01-03'\nauthor: 'Nina'\npublished: false`,
      ),
    });

    const read = await readCorpus(spec(root));

    expect(read.articles.map((entry) => entry.path)).toEqual(['yes.md']);
    expect(read.unpublished).toEqual(['no.md', 'silent.md']);
    expect(read.violations).toEqual([]);
  });

  it('refuses a `published` that is not a boolean, so no typo unpublishes an article', async () => {
    const root = await writeCorpus({
      'typo.md': article(
        `title: 'Typo'\nlocale: 'en'\ndate: '2021-01-01'\nauthor: 'Nina'\npublished: "true"`,
      ),
    });

    const read = await readCorpus(spec(root));

    expect(read.violations).toEqual([
      { code: 'non-boolean-published', path: 'typo.md', value: 'true' },
    ]);
    expect(read.articles).toEqual([]);
  });
});

describe('readCorpus — the schema', () => {
  it('names the file and the field a published article is missing', async () => {
    const root = await writeCorpus({
      'no-title.md': article(
        `locale: 'en'\ndate: '2021-01-01'\nauthor: 'Nina'\npublished: true`,
      ),
      'no-date.md': article(
        `title: 'No date'\nlocale: 'en'\nauthor: 'Nina'\npublished: true`,
      ),
      'no-locale.md': article(
        `title: 'No locale'\ndate: '2021-01-01'\nauthor: 'Nina'\npublished: true`,
      ),
      'no-excerpt.md': article(
        `title: 'No excerpt'\nlocale: 'en'\ndate: '2021-01-01'\nauthor: 'Nina'\npublished: true`,
        { excerpt: null },
      ),
      'no-author.md': article(
        `title: 'No author'\nlocale: 'en'\ndate: '2021-01-01'\npublished: true`,
      ),
    });

    const { violations, articles } = await readCorpus(spec(root));

    expect(articles).toEqual([]);
    expect(violations).toEqual(
      expect.arrayContaining([
        { code: 'missing-field', path: 'no-title.md', field: 'title' },
        { code: 'missing-field', path: 'no-date.md', field: 'date' },
        { code: 'missing-field', path: 'no-locale.md', field: 'locale' },
        { code: 'missing-field', path: 'no-excerpt.md', field: 'excerpt' },
        { code: 'missing-field', path: 'no-author.md', field: 'author' },
      ]),
    );
  });

  /**
   * R-ARTICLEPAGE-07: the author is required on the same footing as the title,
   * so an article declaring none indexes no entry and fails the build. An
   * optional field would leave that article publishable, which is the case the
   * requirement is about.
   */
  it('indexes no article for a file declaring no author, as for one declaring no title', async () => {
    const root = await writeCorpus({
      'silent-author.md': article(
        `title: 'Whose is it'\nlocale: 'en'\ndate: '2021-01-01'\npublished: true`,
      ),
      'signed.md': article(
        `title: 'Signed'\nlocale: 'en'\ndate: '2021-01-02'\nauthor: 'Nina'\npublished: true`,
      ),
    });

    const { articles, violations } = await readCorpus(spec(root));

    expect(articles.map((entry) => entry.path)).toEqual(['signed.md']);
    expect(violations).toEqual([
      { code: 'missing-field', path: 'silent-author.md', field: 'author' },
    ]);
  });

  it('treats an empty author as no author at all', async () => {
    const root = await writeCorpus({
      'blank.md': article(
        `title: 'Blank'\nlocale: 'en'\ndate: '2021-01-01'\nauthor: '   '\npublished: true`,
      ),
    });

    const { violations } = await readCorpus(spec(root));

    expect(violations).toEqual([
      { code: 'missing-field', path: 'blank.md', field: 'author' },
    ]);
  });

  it('validates the unpublished files too, so a flag added later reveals nothing', async () => {
    const root = await writeCorpus({
      'later.md': article(`locale: 'en'\ndate: '2021-01-01'\nauthor: 'Nina'`),
    });

    const { violations, unpublished } = await readCorpus(spec(root));

    expect(unpublished).toEqual(['later.md']);
    expect(violations).toEqual([
      { code: 'missing-field', path: 'later.md', field: 'title' },
    ]);
  });

  it('refuses a date that is not a YYYY-MM-DD calendar date', async () => {
    const root = await writeCorpus({
      'shape.md': article(
        `title: 'A'\nlocale: 'en'\ndate: '20/01/2022'\nauthor: 'Nina'\npublished: true`,
      ),
      'calendar.md': article(
        `title: 'B'\nlocale: 'en'\ndate: '2022-02-31'\nauthor: 'Nina'\npublished: true`,
      ),
    });

    const { violations } = await readCorpus(spec(root));

    expect(violations).toEqual(
      expect.arrayContaining([
        { code: 'malformed-date', path: 'shape.md', date: '20/01/2022' },
        { code: 'malformed-date', path: 'calendar.md', date: '2022-02-31' },
      ]),
    );
  });

  it('accepts the date YAML parses as a timestamp, which is the same YYYY-MM-DD', async () => {
    const root = await writeCorpus({
      'unquoted.md': article(
        `title: 'A'\nlocale: 'en'\ndate: 2021-11-30\nauthor: 'Nina'\npublished: true`,
      ),
    });

    const { articles, violations } = await readCorpus(spec(root));

    expect(violations).toEqual([]);
    expect(articles[0].date).toBe('2021-11-30');
  });

  it('names the file whose frontmatter cannot be read', async () => {
    const root = await writeCorpus({
      'broken.md':
        "---\ntitle: 'unterminated\nlocale: 'en'\n---\n\nExcerpt\n\n---\n\nBody\n",
    });

    const { violations } = await readCorpus(spec(root));

    expect(violations).toHaveLength(1);
    expect(violations[0].code).toBe('unreadable-frontmatter');
    expect(violations[0]).toMatchObject({ path: 'broken.md' });
  });

  it('refuses two published articles of one locale sharing a translation identifier, naming both', async () => {
    const root = await writeCorpus({
      'one.md': article(
        `title: 'One'\nlocale: 'en'\ndate: '2021-01-01'\ntranslationId: yield-farming\nauthor: 'Nina'\npublished: true`,
      ),
      'two.md': article(
        `title: 'Two'\nlocale: 'en'\ndate: '2021-01-02'\ntranslationId: yield-farming\nauthor: 'Nina'\npublished: true`,
      ),
    });

    const { violations } = await readCorpus(spec(root));

    expect(violations).toEqual([
      {
        code: 'duplicate-translation-id',
        path: 'one.md',
        translationId: 'yield-farming',
        locale: 'en',
      },
      {
        code: 'duplicate-translation-id',
        path: 'two.md',
        translationId: 'yield-farming',
        locale: 'en',
      },
    ]);
  });

  it('accepts one translation identifier shared across two locales, which is its purpose', async () => {
    const root = await writeCorpus({
      'en.md': article(
        `title: 'The source of Yield Farming profits'\nlocale: 'en'\ndate: '2021-11-30'\ntranslationId: yield-farming\nauthor: 'Nina'\npublished: true`,
      ),
      'fr.md': article(
        `title: 'Provenance des rendements du Yield Farming'\nlocale: 'fr'\ndate: '2021-11-30'\ntranslationId: yield-farming\nauthor: 'Nina'\npublished: true`,
      ),
    });

    const { violations, articles } = await readCorpus(spec(root));

    expect(violations).toEqual([]);
    expect(articles.map((entry) => entry.translationId)).toEqual([
      'yield-farming',
      'yield-farming',
    ]);
  });

  it('reports a corpus root that does not exist rather than an empty corpus', async () => {
    const missing = join(tmpdir(), 'pyramids-content-no-such-corpus-root');

    const read = await readCorpus(spec(missing));

    expect(read.violations).toEqual([
      { code: 'missing-corpus-root', root: missing },
    ]);
    expect(read.articles).toEqual([]);
  });

  it('returns the violations of a corpus that breaks every rule, and never throws', async () => {
    const root = await writeCorpus({
      'a.md': article(
        `locale: 'en'\ndate: 'yesterday'\nauthor: 'Nina'\npublished: "yes"`,
      ),
      'b.md': article(
        `title: 'B'\ndate: '2021-01-01'\nauthor: 'Nina'\npublished: true`,
        {
          excerpt: null,
        },
      ),
    });

    const read = await readCorpus(spec(root));

    expect(read.articles).toEqual([]);
    expect(read.violations.length).toBeGreaterThan(3);
    expect(read.violations.every((violation) => 'code' in violation)).toBe(
      true,
    );
  });

  it('accepts an empty corpus root, which is a corpus with no article', async () => {
    const root = await writeCorpus({});

    const read = await readCorpus(spec(root));

    expect(read).toMatchObject({
      articles: [],
      violations: [],
      unpublished: [],
    });
  });
});

/**
 * The real corpus is 11 articles at a roll size of 12, so `next build` produces
 * no `/articles/p/{n}` at all and stops exercising the roll. The shape is
 * exercised here on the input side — an index long enough to paginate, in one
 * order — and in the 13 `urlSet` tests of `pyramids-routing` on the derivation
 * side, which is where a page count is computed from a roll size.
 */
describe('readCorpus — a corpus longer than one roll page', () => {
  it('carries every article of a thirty-article corpus, newest first, in one list', async () => {
    const files = Object.fromEntries(
      Array.from({ length: 30 }, (_, i) => {
        const rank = String(i + 1).padStart(2, '0');
        return [
          `roll/article-${rank}.md`,
          article(
            `title: 'Article ${rank}'\nlocale: 'en'\ndate: '2026-01-${rank}'\ncategory: javascript\nauthor: 'Nina'\npublished: true`,
          ),
        ];
      }),
    );
    const root = await writeCorpus(files);

    const { articles, violations } = await readCorpus(spec(root));

    expect(violations).toEqual([]);
    expect(articles).toHaveLength(30);
    expect(articles[0].date).toBe('2026-01-30');
    expect(articles[29].date).toBe('2026-01-01');
  });
});
