import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { readCorpus } from './read-corpus.js';

/**
 * The corpus the v2 site inherits, read where it still lives.
 *
 * `migrate-learn-content` moves these eleven files into
 * `apps/robusta-build/content/articles`; until it does, this is the only place
 * the reader can be held against real content rather than against a fixture.
 * What the test pins is what the migration will and will not have to fix.
 */
const V1_CORPUS = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../apps/robusta/content/blog',
);

const SLUGS = [
  'ledger-versus-metamask',
  'tooling-for-solidity-coders',
  'provenance-des-rendements-du-yield-farming-dans-la-blockchain',
  'the-source-of-yield-farming-profits',
  'pourquoi-jai-migre-de-gatsby-vers-nextjs',
  'applying-correctly-classname-with-styled-components',
  'completing-a-rxjs-observable-with-another',
  'why-i-made-the-migration-from-gatsby-toward-nextjs',
  'leaving-gmail',
  'quel-langage-pour-progresser-dans-sa-carriere',
  'easy-automation-with-sonoff-and-javascript',
];

describe('the migrated corpus, read through the v2 schema', () => {
  const read = async () =>
    readCorpus({ root: V1_CORPUS, localeFrom: 'frontmatter' });

  it('passes the schema as it stands: eleven published articles and no violation', async () => {
    const { articles, unpublished, violations } = await read();

    expect(violations).toEqual([]);
    expect(articles).toHaveLength(11);
    expect(unpublished).toEqual([]);
  });

  it('addresses them at the slugs the v1 mapping was computed from', async () => {
    const { articles } = await read();

    expect(articles.map((entry) => entry.slug).sort()).toEqual([...SLUGS].sort());
  });

  it('carries an excerpt and an image for every one of them, so a blog roll costs no render', async () => {
    const { articles } = await read();

    expect(articles.every((entry) => entry.excerpt.length > 0)).toBe(true);
    expect(articles.every((entry) => entry.image !== undefined)).toBe(true);
  });

  /**
   * The one thing the migration still owes the index, measured rather than
   * assumed: these files name their category `categoryPath`, which the v2
   * schema does not read, and one of them nests it as `javascript/typescript`.
   * Every article therefore arrives with no category and would be addressed at
   * `/articles/{slug}` rather than `/articles/c/{category}/{slug}`.
   */
  it('claims no category yet, because the field is still named categoryPath', async () => {
    const { articles } = await read();

    expect(articles.every((entry) => entry.category === undefined)).toBe(true);
  });

  it('splits into six English and five French articles, the two locale defects included', async () => {
    const { articles } = await read();
    const byLocale = articles.reduce<Record<string, number>>(
      (count, entry) => ({ ...count, [entry.locale]: (count[entry.locale] ?? 0) + 1 }),
      {},
    );

    expect(byLocale).toEqual({ en: 6, fr: 5 });
  });
});
