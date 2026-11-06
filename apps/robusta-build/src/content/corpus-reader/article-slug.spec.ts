import { describe, expect, it } from 'vitest';
import { articleSlug } from './article-slug.ts';

/**
 * R-CONTENTSOURCE-45 and AC-CONTENTSOURCE-45. `articleSlug` is frozen, and the
 * table below is what freezing means: every row of the v1 mapping in
 * `apps/robusta-build/src/routing/v1-url-map.ts` was computed from these values,
 * so a slug that moves turns an indexed URL into a 404.
 *
 * The expectations are literals rather than a second derivation, so this test
 * fails when the derivation changes instead of following it. Each `title` and
 * `locale` is the v1 frontmatter at `6c57bc3:apps/robusta/content/blog/<path>`,
 * not the v2 corpus, where two locales were corrected since.
 */
interface V1Article {
  title: string;
  locale: string;
  slug: string;
}

const V1_SLUGS: Readonly<Record<string, V1Article>> = {
  'blockchain/ledger-versus-metamask.md': {
    title: 'Ledger versus Metamask',
    locale: 'en',
    slug: 'ledger-versus-metamask',
  },
  'blockchain/start-coding-blockchain.md': {
    title: 'Tooling for Solidity coders',
    locale: 'en',
    slug: 'tooling-for-solidity-coders',
  },
  'blockchain/yield-farming-fr.md': {
    title: 'Provenance des rendements du Yield Farming dans la blockchain',
    locale: 'fr',
    slug: 'provenance-des-rendements-du-yield-farming-dans-la-blockchain',
  },
  'blockchain/yield-farming.md': {
    title: 'The source of Yield Farming profits',
    locale: 'fr',
    slug: 'the-source-of-yield-farming-profits',
  },
  'javascript/pourquoi-migration-gatsby-next-js.md': {
    title: "Pourquoi j'ai migré de Gatsby vers NextJS",
    locale: 'fr',
    slug: 'pourquoi-jai-migre-de-gatsby-vers-nextjs',
  },
  'javascript/styled-components.md': {
    title: 'Applying correctly className with Styled components',
    locale: 'en',
    slug: 'applying-correctly-classname-with-styled-components',
  },
  'javascript/typescript/completes-with.md': {
    title: 'Completing a RxJs Observable with another',
    locale: 'en',
    slug: 'completing-a-rxjs-observable-with-another',
  },
  'javascript/why-migration-gatsby-next.md': {
    title: 'Why I made the migration from Gatsby toward NextJS',
    locale: 'fr',
    slug: 'why-i-made-the-migration-from-gatsby-toward-nextjs',
  },
  'privacy/leaving-gmail.md': {
    title: 'Leaving Gmail',
    locale: 'en',
    slug: 'leaving-gmail',
  },
  'theory/quel-second-langage.md': {
    title: 'Quel langage pour progresser dans sa carrière ?',
    locale: 'fr',
    slug: 'quel-langage-pour-progresser-dans-sa-carriere',
  },
  'web/easy-automation-with-sonoff.md': {
    title: 'Easy automation with Sonoff and Javascript',
    locale: 'en',
    slug: 'easy-automation-with-sonoff-and-javascript',
  },
};

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
  it('is the eleven articles the migration carries', () => {
    expect(Object.keys(V1_SLUGS)).toHaveLength(11);
  });

  for (const [path, { title, locale, slug }] of Object.entries(V1_SLUGS)) {
    it(`derives '${slug}' from ${path}, exactly as v1 did`, () => {
      expect(articleSlug(title, locale)).toBe(slug);
    });
  }
});
