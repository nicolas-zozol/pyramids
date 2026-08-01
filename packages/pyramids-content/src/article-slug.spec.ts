import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { describe, expect, it } from 'vitest';
import { articleSlug } from './article-slug.js';

/**
 * R-CONTENTSOURCE-45 and AC-CONTENTSOURCE-45. `articleSlug` is frozen, and the
 * table below is what freezing means: every row of the v1 mapping in
 * `apps/robusta-build/src/routing/v1-url-map.ts` was computed from these values,
 * so a slug that moves turns an indexed URL into a 404.
 *
 * The expectations are literals rather than a second derivation, so this test
 * fails when the derivation changes instead of following it.
 */
const V1_SLUGS: Readonly<Record<string, string>> = {
  'blockchain/ledger-versus-metamask.md': 'ledger-versus-metamask',
  'blockchain/start-coding-blockchain.md': 'tooling-for-solidity-coders',
  'blockchain/yield-farming-fr.md':
    'provenance-des-rendements-du-yield-farming-dans-la-blockchain',
  'blockchain/yield-farming.md': 'the-source-of-yield-farming-profits',
  'javascript/pourquoi-migration-gatsby-next-js.md':
    'pourquoi-jai-migre-de-gatsby-vers-nextjs',
  'javascript/styled-components.md':
    'applying-correctly-classname-with-styled-components',
  'javascript/typescript/completes-with.md':
    'completing-a-rxjs-observable-with-another',
  'javascript/why-migration-gatsby-next.md':
    'why-i-made-the-migration-from-gatsby-toward-nextjs',
  'privacy/leaving-gmail.md': 'leaving-gmail',
  'theory/quel-second-langage.md':
    'quel-langage-pour-progresser-dans-sa-carriere',
  'web/easy-automation-with-sonoff.md':
    'easy-automation-with-sonoff-and-javascript',
};

/**
 * The v1 corpus of record, read where it still lives. `retire-robusta-v1`
 * deletes this tree; the day it does, the loop below goes and the table above
 * stays, because the table is the contract and the tree is only the witness.
 */
const V1_CORPUS = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../apps/robusta/content/blog',
);

describe('articleSlug', () => {
  it('derives from the title, lowercase and strict', () => {
    expect(articleSlug('Ledger versus Metamask', 'en')).toBe(
      'ledger-versus-metamask',
    );
  });

  it('strips the punctuation `strict` removes rather than transliterating it', () => {
    expect(articleSlug("Pourquoi j'ai migré de Gatsby vers NextJS", 'fr')).toBe(
      'pourquoi-jai-migre-de-gatsby-vers-nextjs',
    );
    expect(articleSlug('Quel langage pour progresser dans sa carrière ?', 'fr')).toBe(
      'quel-langage-pour-progresser-dans-sa-carriere',
    );
  });

  it('folds the case of the locale, as the v1 derivation does', () => {
    expect(articleSlug('Leaving Gmail', 'EN')).toBe(
      articleSlug('Leaving Gmail', 'en'),
    );
  });

  it('collapses the separators a title puts side by side', () => {
    expect(articleSlug('Applying correctly className with Styled components', 'en')).toBe(
      'applying-correctly-classname-with-styled-components',
    );
  });
});

describe('the slugs of the migrated corpus', () => {
  const files = readdirSync(V1_CORPUS, { recursive: true })
    .map(String)
    .filter((path) => path.endsWith('.md'))
    .sort();

  it('is the eleven articles the migration carries', () => {
    expect(files).toEqual(Object.keys(V1_SLUGS));
  });

  for (const [path, slug] of Object.entries(V1_SLUGS)) {
    it(`derives '${slug}' from ${path}, exactly as v1 does today`, () => {
      const { data } = matter(readFileSync(join(V1_CORPUS, path), 'utf8'));
      expect(articleSlug(String(data.title), String(data.locale))).toBe(slug);
    });
  }
});
