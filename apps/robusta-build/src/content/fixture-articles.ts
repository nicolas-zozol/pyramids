import type { ArticleIndexEntry } from './article-index.js';

/**
 * The fixture corpus, behind the `getArticleIndex` seam until content-source
 * replaces the implementation and keeps the signature.
 *
 * Two jobs, and they pull in opposite directions, which is why the corpus is
 * built in two halves.
 *
 * The migrated half is the eleven v1 articles as they arrive on v2: the slug
 * `immutableSlugify` derived from the title, which does not change, and the
 * flat category the article claims. `yield-farming.md` and
 * `why-migration-gatsby-next.md` are English pieces whose frontmatter declares
 * `locale: "fr"`; migrate-learn-content's decision of 2026-07-30 corrects them,
 * so the split here is 8 English and 3 French, and the v1 mapping is computed
 * after that correction. `typescript` holds exactly one article — the
 * one-article roll the arbitration of 2026-07-31 accepted knowingly.
 *
 * The pagination half exists because the roll size is fixed at 12 and the real
 * corpus is 11 articles, so the real content produces no roll page at all.
 * Without these, `/articles/p/{n}` would ship unexercised. They carry an
 * explicit `fixture-` prefix so nothing mistakes them for content, and they
 * bring the English roll to 30 articles (three pages), the French roll to 14
 * (two pages), the `javascript` category to 13 (two pages), and they add
 * articles carrying no category at all, which the migrated half has none of.
 */

const migrated: ArticleIndexEntry[] = [
  {
    slug: 'leaving-gmail',
    locale: 'en',
    category: 'privacy',
    title: 'Leaving Gmail',
    date: '2019-05-24',
  },
  {
    slug: 'easy-automation-with-sonoff-and-javascript',
    locale: 'en',
    category: 'web',
    title: 'Easy automation with Sonoff and Javascript',
    date: '2021-01-04',
  },
  {
    slug: 'ledger-versus-metamask',
    locale: 'en',
    category: 'blockchain',
    title: 'Ledger versus Metamask',
    date: '2022-01-20',
  },
  {
    slug: 'tooling-for-solidity-coders',
    locale: 'en',
    category: 'blockchain',
    title: 'Tooling for Solidity coders',
    date: '2021-12-13',
  },
  {
    slug: 'the-source-of-yield-farming-profits',
    locale: 'en',
    category: 'blockchain',
    title: 'The source of Yield Farming profits',
    date: '2021-11-30',
  },
  {
    slug: 'applying-correctly-classname-with-styled-components',
    locale: 'en',
    category: 'javascript',
    title: 'Applying correctly className with Styled components',
    date: '2020-11-05',
  },
  {
    slug: 'why-i-made-the-migration-from-gatsby-toward-nextjs',
    locale: 'en',
    category: 'javascript',
    title: 'Why I made the migration from Gatsby toward NextJS',
    date: '2021-11-08',
  },
  {
    slug: 'completing-a-rxjs-observable-with-another',
    locale: 'en',
    category: 'typescript',
    title: 'Completing a RxJs Observable with another',
    date: '2021-05-23',
  },
  {
    slug: 'quel-langage-pour-progresser-dans-sa-carriere',
    locale: 'fr',
    category: 'theory',
    title: 'Quel langage pour progresser dans sa carrière ?',
    date: '2020-12-13',
  },
  {
    slug: 'provenance-des-rendements-du-yield-farming-dans-la-blockchain',
    locale: 'fr',
    category: 'blockchain',
    title: 'Provenance des rendements du Yield Farming dans la blockchain',
    date: '2021-11-30',
  },
  {
    slug: 'pourquoi-jai-migre-de-gatsby-vers-nextjs',
    locale: 'fr',
    category: 'javascript',
    title: "Pourquoi j'ai migré de Gatsby vers NextJS",
    date: '2021-11-08',
  },
];

function pagination(
  count: number,
  locale: string,
  category?: string,
): ArticleIndexEntry[] {
  return Array.from({ length: count }, (_, i) => {
    const rank = String(i + 1).padStart(2, '0');
    const family = category ?? 'uncategorised';
    return {
      slug: `fixture-${locale}-${family}-${rank}`,
      locale,
      ...(category === undefined ? {} : { category }),
      title: `Fixture ${family} article ${rank} (${locale})`,
      date: `2026-01-${rank}`,
    };
  });
}

const forPagination: ArticleIndexEntry[] = [
  ...pagination(11, 'en', 'javascript'),
  ...pagination(4, 'en', 'web'),
  ...pagination(7, 'en'),
  ...pagination(5, 'fr', 'blockchain'),
  ...pagination(6, 'fr'),
];

export const fixtureArticles: ArticleIndexEntry[] = [...migrated, ...forPagination];
