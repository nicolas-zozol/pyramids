import {
  access,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, posix, relative, resolve, sep } from 'node:path';
import {
  copyCorpusAssets,
  readArticleBody,
  readCorpus,
  type CorpusSpec,
} from './corpus-reader/index.ts';
import { buildUrl, urlSet } from '../routing/url-scheme/index.ts';
import { afterAll, describe, expect, it } from 'vitest';
import { urlScheme } from '../routing/scheme.ts';
import { v1UrlMap } from '../routing/v1-url-map.ts';
import {
  getArticleBody,
  getArticleIndex,
  getTranslationNotices,
} from './article-index.ts';
import { corpus } from './corpus.ts';

/**
 * The site's corpus, read through the site's own declaration.
 *
 * This spec came from `packages/pyramids-content/src`, where it reached across
 * two workspace boundaries into `apps/robusta/content/blog` to hold the reader
 * against real content. Here it reads the corpus the site actually serves, which
 * is both shorter and stricter: a change to `corpus.ts` now moves the test
 * (R-MIGRATELEARN-82). `process.cwd()` is the app directory under vitest exactly
 * as it is under `next build`, so no path is rebuilt here.
 */

const SLUGS = [
  'ledger-contre-metamask',
  'les-bons-outils-pour-coder-en-solidity',
  'terminer-un-observable-rxjs-avec-un-autre',
  'domotique-facile-avec-sonoff-et-javascript',
  'bien-appliquer-classname-avec-styled-components',
  'quitter-gmail',
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

/**
 * What `urlSet` derives from the seventeen articles: no roll page, neither
 * locale reaching 12. The nine French articles are under `/fr`, the eight
 * English ones unprefixed, and no Spanish article lights up `/es/articles`.
 */
const URLS = [
  '/fr/articles',
  '/fr/articles/c/blockchain',
  '/fr/articles/c/javascript',
  '/fr/articles/c/privacy',
  '/fr/articles/c/theory',
  '/fr/articles/c/typescript',
  '/fr/articles/c/web',
  '/fr/articles/c/blockchain/ledger-contre-metamask',
  '/fr/articles/c/blockchain/les-bons-outils-pour-coder-en-solidity',
  '/fr/articles/c/blockchain/provenance-des-rendements-du-yield-farming-dans-la-blockchain',
  '/fr/articles/c/javascript/bien-appliquer-classname-avec-styled-components',
  '/fr/articles/c/javascript/pourquoi-jai-migre-de-gatsby-vers-nextjs',
  '/fr/articles/c/privacy/quitter-gmail',
  '/fr/articles/c/theory/quel-langage-pour-progresser-dans-sa-carriere',
  '/fr/articles/c/typescript/terminer-un-observable-rxjs-avec-un-autre',
  '/fr/articles/c/web/domotique-facile-avec-sonoff-et-javascript',
  '/articles',
  '/articles/c/blockchain',
  '/articles/c/javascript',
  '/articles/c/privacy',
  '/articles/c/typescript',
  '/articles/c/web',
  '/articles/c/blockchain/ledger-versus-metamask',
  '/articles/c/blockchain/the-source-of-yield-farming-profits',
  '/articles/c/blockchain/tooling-for-solidity-coders',
  '/articles/c/javascript/applying-correctly-classname-with-styled-components',
  '/articles/c/javascript/why-i-made-the-migration-from-gatsby-toward-nextjs',
  '/articles/c/privacy/leaving-gmail',
  '/articles/c/typescript/completing-a-rxjs-observable-with-another',
  '/articles/c/web/easy-automation-with-sonoff-and-javascript',
];

const MARKDOWN_IMAGE = /!\[[^\]]*\]\(\s*<?([^>\s)]+)>?/g;

const read = () => readCorpus(corpus);
const root = resolve(process.cwd(), corpus.root);

const temporary: string[] = [];

afterAll(async () => {
  await Promise.all(
    temporary
      .splice(0)
      .map((path) => rm(path, { recursive: true, force: true })),
  );
});

async function temporaryPublishDir(): Promise<string> {
  const parent = await mkdtemp(join(tmpdir(), 'robusta-build-assets-'));
  temporary.push(parent);
  return join(parent, 'article-images');
}

async function filesUnder(directory: string): Promise<string[]> {
  const found = await readdir(directory, {
    recursive: true,
    withFileTypes: true,
  });
  return found
    .filter((entry) => entry.isFile())
    .map((entry) =>
      relative(directory, join(entry.parentPath, entry.name))
        .split(sep)
        .join('/'),
    )
    .sort();
}

describe('the migrated corpus, read through the site’s own declaration', () => {
  it('holds seventeen published articles, with no violation', async () => {
    const { articles, violations } = await read();

    expect(violations).toEqual([]);
    expect(articles).toHaveLength(17);
  });

  it('addresses them at the eleven slugs of v1 and the six of their translations', async () => {
    const { articles } = await read();

    expect(articles.map((entry) => entry.slug).sort()).toEqual(
      [...SLUGS].sort(),
    );
  });

  it('carries an excerpt and an image for every one of them, so a blog roll costs no render', async () => {
    const { articles } = await read();

    expect(articles.every((entry) => entry.excerpt.length > 0)).toBe(true);
    expect(articles.every((entry) => entry.image !== undefined)).toBe(true);
  });

  /**
   * R-ARTICLEPAGE-08. The author is required, and two of the eleven declared
   * none until the correction of 2026-08-02 — a corpus that still carried them
   * would index nine articles and fail the build on the other two.
   */
  it('names an author on every one of them, the field being required', async () => {
    const { articles } = await read();

    expect([...new Set(articles.map((entry) => entry.author))]).toEqual([
      'Nicolas Zozol',
    ]);
  });

  /**
   * The conversion this story is: v1 declared `categoryPath`, which the v2 schema
   * does not read, so every article arrived with no category. A category is one
   * segment, and `javascript/typescript` names its leaf (R-MIGRATELEARN-04).
   */
  it('claims six flat categories, none of them nesting', async () => {
    const { articles } = await read();
    const claimed = articles.map((entry) => entry.category);

    expect(claimed.every((category) => category !== undefined)).toBe(true);
    expect([...new Set(claimed)].sort()).toEqual([
      'blockchain',
      'javascript',
      'privacy',
      'theory',
      'typescript',
      'web',
    ]);
    expect(claimed.some((category) => (category as string).includes('/'))).toBe(
      false,
    );
  });

  it('splits into eight English and nine French articles, the two locale defects corrected', async () => {
    const { articles } = await read();
    const byLocale = articles.reduce<Record<string, number>>(
      (count, entry) => ({
        ...count,
        [entry.locale]: (count[entry.locale] ?? 0) + 1,
      }),
      {},
    );

    expect(byLocale).toEqual({ en: 8, fr: 9 });
  });

  it('pairs every English article with its French translation, the theory article alone in French', async () => {
    const { articles } = await read();
    const paired = articles.filter(
      (entry) => entry.translationId !== undefined,
    );

    const pairs = new Map<string, string[]>();
    for (const entry of paired) {
      const key = entry.translationId as string;
      pairs.set(key, [...(pairs.get(key) ?? []), entry.locale].sort());
    }

    expect(paired).toHaveLength(16);
    expect([...pairs.entries()].sort()).toEqual([
      ['completes-with', ['en', 'fr']],
      ['easy-automation-with-sonoff', ['en', 'fr']],
      ['gatsby-to-nextjs', ['en', 'fr']],
      ['leaving-gmail', ['en', 'fr']],
      ['ledger-versus-metamask', ['en', 'fr']],
      ['start-coding-blockchain', ['en', 'fr']],
      ['styled-components', ['en', 'fr']],
      ['yield-farming', ['en', 'fr']],
    ]);
  });
});

describe('the originals of its translations', () => {
  it('declares the six French translations of English originals, and the two English translations of French ones', async () => {
    const { articles } = await read();
    const declared = Object.fromEntries(
      articles
        .filter((entry) => entry.original !== undefined)
        .map((entry) => [entry.path, entry.original?.locale]),
    );

    expect(declared).toEqual({
      'blockchain/ledger-contre-metamask.md': 'en',
      'blockchain/outillage-solidity.md': 'en',
      'javascript/bien-appliquer-classname-styled-components.md': 'en',
      'javascript/typescript/terminer-observable-rxjs.md': 'en',
      'privacy/quitter-gmail.md': 'en',
      'web/domotique-facile-avec-sonoff.md': 'en',
      'blockchain/yield-farming.md': 'fr',
      'javascript/why-migration-gatsby-next.md': 'fr',
    });
  });

  it('declares every translation up to date with its original, so the build reports no notice', async () => {
    const { translationNotices, violations } = await read();

    expect(violations).toEqual([]);
    expect(translationNotices).toEqual([]);
    expect(await getTranslationNotices()).toEqual([]);
  });
});

/**
 * R-MIGRATELEARN-21 and 23. `violations` being empty already says this, and it is
 * worth asserting a second way: an unresolved reference is the one class the
 * empty corpus could never have raised, so it is the one nothing was watching.
 */
describe('the images the corpus references', () => {
  const referencesOf = async (path: string): Promise<string[]> => {
    const raw = await readFile(join(root, path), 'utf8');
    const body = raw.slice(raw.indexOf('\n---', 3));
    const cover = raw
      .slice(0, raw.indexOf('\n---', 3))
      .match(/^image:\s*(.*)$/m);

    return [
      ...(cover === null ? [] : [cover[1].trim()]),
      ...[...body.matchAll(MARKDOWN_IMAGE)].map((match) => match[1]),
    ];
  };

  const referenced = async (): Promise<string[]> => {
    const { articles } = await read();
    const paths = new Set<string>();

    for (const entry of articles) {
      for (const reference of await referencesOf(entry.path)) {
        paths.add(
          posix.normalize(posix.join(posix.dirname(entry.path), reference)),
        );
      }
    }

    return [...paths].sort();
  };

  it('resolves every one of them to a file inside the corpus, covers included', async () => {
    const paths = await referenced();

    expect(paths).toHaveLength(44);
    await Promise.all(paths.map((path) => access(join(root, path))));
  });

  it('keeps them beside the articles that reference them, in six directories', async () => {
    const directories = new Set(
      (await referenced()).map((path) => posix.dirname(path)),
    );

    expect([...directories].sort()).toEqual([
      'blockchain/images',
      'images',
      'javascript/images',
      'privacy/images',
      'theory/images',
      'web/images',
    ]);
  });
});

/** R-MIGRATELEARN-28 and 29: the step publishes the referenced set and owns its directory. */
describe('the copy step, over the site’s corpus', () => {
  const into = (publishDir: string): CorpusSpec => ({
    ...corpus,
    assets: { publishDir, urlPrefix: '/article-images' },
  });

  it('publishes the forty-four referenced files and nothing else', async () => {
    const publishDir = await temporaryPublishDir();

    const copied = await copyCorpusAssets(into(publishDir));

    expect(copied).toHaveLength(44);
    expect(await filesUnder(publishDir)).toEqual([...copied].sort());
  });

  it('leaves nothing a previous run wrote, the tree being produced in full', async () => {
    const publishDir = await temporaryPublishDir();
    await copyCorpusAssets(into(publishDir));
    await writeFile(
      join(publishDir, 'blockchain/images/renamed-away.png'),
      'PNG',
      'utf8',
    );

    await copyCorpusAssets(into(publishDir));

    expect(await filesUnder(publishDir)).not.toContain(
      'blockchain/images/renamed-away.png',
    );
  });
});

/**
 * A slug or a category that moves is caught here rather than in the build, and
 * `scripts/check-route-table.mjs` then holds the prerender manifest against this
 * same derivation (AC-MIGRATELEARN-61).
 */
// R-SEOEXCELLENCE-102, AC-SEOEXCELLENCE-7: the page gives the h1, never the body.
describe('the bodies of the corpus', () => {
  it('render no first-level heading, the page titling the article once', async () => {
    const withH1: string[] = [];
    for (const entry of await getArticleIndex()) {
      if (/<h1[\s>]/.test((await getArticleBody(entry)).html))
        withH1.push(entry.path);
    }

    expect(withH1).toEqual([]);
  });

  it('keep the sections of quel-second-langage one level down, its tree intact', async () => {
    const [entry] = (await getArticleIndex()).filter(
      (article) => article.path === 'theory/quel-second-langage.md',
    );
    const { html } = await getArticleBody(entry);

    expect(html).toContain('<h2>Objectifs</h2>');
    expect(html).toContain('<h3>La Java Virtual Machine</h3>');
    expect(html).toContain('<h4>Java</h4>');
  });
});

describe('what the corpus lights up', () => {
  it('derives thirty content URLs, and no roll page in either locale', async () => {
    const pages = urlSet(urlScheme, await getArticleIndex());
    const built = pages.map((page) => buildUrl(urlScheme, page));

    expect([...built].sort()).toEqual([...URLS].sort());
    expect(built).toHaveLength(30);
    expect(built.filter((url) => url.includes('/p/'))).toEqual([]);
  });

  it('serves sixteen of them under /fr and fourteen unprefixed under /articles, none under /en', async () => {
    const pages = urlSet(urlScheme, await getArticleIndex());
    const french = pages.filter((page) => page.locale === 'fr');
    const english = pages.filter((page) => page.locale === 'en');

    expect(french).toHaveLength(16);
    expect(
      french.every((page) => buildUrl(urlScheme, page).startsWith('/fr/')),
    ).toBe(true);
    expect(english).toHaveLength(14);
    expect(
      english.every((page) =>
        buildUrl(urlScheme, page).startsWith('/articles'),
      ),
    ).toBe(true);
  });

  it('lights up nothing under /es/articles while no Spanish article is published', async () => {
    const built = urlSet(urlScheme, await getArticleIndex()).map((page) =>
      buildUrl(urlScheme, page),
    );

    expect(built.filter((url) => url.startsWith('/es'))).toEqual([]);
    expect(built.filter((url) => /^\/en(\/|$)/.test(url))).toEqual([]);
  });

  it('reaches the two articles of AC-ROOTLOCALE-2, the English one unprefixed', async () => {
    const built = urlSet(urlScheme, await getArticleIndex()).map((page) =>
      buildUrl(urlScheme, page),
    );

    expect(built).toContain('/articles/c/privacy/leaving-gmail');
    expect(built).toContain(
      '/fr/articles/c/blockchain/provenance-des-rendements-du-yield-farming-dans-la-blockchain',
    );
  });

  it('gives a category a page only in the Locales whose articles claim it', async () => {
    const built = urlSet(urlScheme, await getArticleIndex()).map((page) =>
      buildUrl(urlScheme, page),
    );

    expect(built).toContain('/articles/c/web');
    expect(built).toContain('/fr/articles/c/web');
    expect(built).toContain('/fr/articles/c/theory');
    expect(built).not.toContain('/articles/c/theory');
  });

  /**
   * R-MIGRATELEARN-61. v1 emitted `[...post.categories, 's', post.slug]` for every
   * article whatever its locale, so an article row's source carries no locale
   * segment; the locale-marked form is listed as a second row rather than as the
   * only one. Without this the three French articles would be mapped at
   * `/learn/fr/...`, which nothing ever published, while their true addresses fell
   * through to the `/learn/:path*` rule and answered 410 Gone.
   */
  it('maps a French article from the unmarked v1 path v1 actually published', async () => {
    const rows = v1UrlMap(urlScheme, await getArticleIndex());
    const of = (from: string) =>
      rows.find((row) => row.from === from)?.destination;

    expect(
      of('/learn/theory/s/quel-langage-pour-progresser-dans-sa-carriere'),
    ).toEqual({
      kind: 'permanent',
      to: '/fr/articles/c/theory/quel-langage-pour-progresser-dans-sa-carriere',
    });
    expect(
      of('/learn/fr/theory/s/quel-langage-pour-progresser-dans-sa-carriere'),
    ).toEqual({
      kind: 'permanent',
      to: '/fr/articles/c/theory/quel-langage-pour-progresser-dans-sa-carriere',
    });
  });

  it('lists every article v1 published at its unmarked source, and only the French ones twice', async () => {
    const rows = v1UrlMap(urlScheme, await getArticleIndex());
    // The raw markdown rows share the `/s/` discriminant and are a class of
    // their own: they end in `.md`, an article row ends in a slug.
    const articleRows = rows.filter(
      (row) => row.from.includes('/s/') && !row.from.endsWith('.md'),
    );

    expect(articleRows).toHaveLength(14);
    expect(
      articleRows.filter((row) => !row.from.startsWith('/learn/fr/')),
    ).toHaveLength(11);
    expect(
      articleRows.filter((row) => row.from.startsWith('/learn/fr/')),
    ).toHaveLength(3);
  });

  it('flattens the nested v1 category of the one article that declared one', async () => {
    const rows = v1UrlMap(urlScheme, await getArticleIndex());

    expect(
      rows.find(
        (row) =>
          row.from ===
          '/learn/javascript/typescript/s/completing-a-rxjs-observable-with-another',
      )?.destination,
    ).toEqual({
      kind: 'permanent',
      to: '/articles/c/typescript/completing-a-rxjs-observable-with-another',
    });
  });
});

/**
 * R-ARTICLEPAGE-21 over the corpus the site actually serves. Nine of the eleven
 * articles carry body images written as `./images/…`, which is where the author
 * put the file and not where the site publishes it; before this the rendered
 * body handed a page references that resolved to nothing.
 */
describe('the body a page receives', () => {
  const prefix = corpus.assets?.urlPrefix as string;

  const bodies = async (): Promise<{ path: string; html: string }[]> => {
    const { articles } = await read();
    return Promise.all(
      articles.map(async (entry) => ({
        path: entry.path,
        html: (await readArticleBody(corpus, entry)).html,
      })),
    );
  };

  const sources = (html: string): string[] =>
    [...html.matchAll(/<img[^>]*\ssrc="([^"]+)"/g)].map((match) => match[1]);

  it('serves the body images of an article under the asset root, at their place in the corpus', async () => {
    const { articles } = await read();
    const gatsby = articles.find(
      (entry) =>
        entry.path === 'javascript/pourquoi-migration-gatsby-next-js.md',
    );

    const { html } = await readArticleBody(
      corpus,
      gatsby as (typeof articles)[number],
    );

    expect(sources(html)).toEqual([
      `${prefix}/javascript/images/gatsby-plugin-bug.png`,
      `${prefix}/javascript/images/graph-ql-blog.png`,
      `${prefix}/javascript/images/structure-gatsby.png`,
      `${prefix}/javascript/images/structure-next.png`,
      `${prefix}/javascript/images/404.png`,
    ]);
  });

  it('hands no article-relative reference to any page, and names a real file every time', async () => {
    const rendered = await bodies();
    const referenced = rendered.flatMap(({ html }) => sources(html));

    expect(referenced.length).toBeGreaterThan(0);
    expect(referenced.every((source) => source.startsWith(`${prefix}/`))).toBe(
      true,
    );
    await Promise.all(
      referenced.map((source) =>
        access(join(root, source.slice(prefix.length + 1))),
      ),
    );
  });

  it('leaves the links the articles carry to other hosts as their authors wrote them', async () => {
    const rendered = await bodies();
    const external = rendered.flatMap(({ html }) =>
      [...html.matchAll(/<a[^>]*\shref="(https?:[^"]+)"/g)].map(
        (match) => match[1],
      ),
    );

    expect(external.length).toBeGreaterThan(0);
    expect(external.every((href) => !href.includes(prefix))).toBe(true);
  });
});

/** The site's own asset paths, so the six directories above have addresses. */
describe('the asset root', () => {
  it('publishes under a segment of its own, outside every shape the scheme reserves', () => {
    expect(corpus.assets?.urlPrefix).toBe('/article-images');
    expect(URLS.some((url) => url.startsWith('/article-images'))).toBe(false);
    expect(dirname(corpus.assets?.publishDir ?? '')).toBe('public');
  });
});
