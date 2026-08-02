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
} from '@robusta/pyramids-content';
import { buildUrl, urlSet } from '@robusta/pyramids-routing';
import { afterAll, describe, expect, it } from 'vitest';
import { urlScheme } from '../routing/scheme.js';
import { v1UrlMap } from '../routing/v1-url-map.js';
import { getArticleIndex } from './article-index.js';
import { corpus } from './corpus.js';

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

/** What `urlSet` derives from the eleven articles: no roll page, neither locale reaching 12. */
const URLS = [
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
  '/l/fr/articles',
  '/l/fr/articles/c/blockchain',
  '/l/fr/articles/c/javascript',
  '/l/fr/articles/c/theory',
  '/l/fr/articles/c/blockchain/provenance-des-rendements-du-yield-farming-dans-la-blockchain',
  '/l/fr/articles/c/javascript/pourquoi-jai-migre-de-gatsby-vers-nextjs',
  '/l/fr/articles/c/theory/quel-langage-pour-progresser-dans-sa-carriere',
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
  it('holds eleven published articles, with no violation and no unpublished path', async () => {
    const { articles, unpublished, violations } = await read();

    expect(violations).toEqual([]);
    expect(articles).toHaveLength(11);
    expect(unpublished).toEqual([]);
  });

  it('addresses them at the slugs the v1 mapping was computed from', async () => {
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

  it('splits into eight English and three French articles, the two locale defects corrected', async () => {
    const { articles } = await read();
    const byLocale = articles.reduce<Record<string, number>>(
      (count, entry) => ({
        ...count,
        [entry.locale]: (count[entry.locale] ?? 0) + 1,
      }),
      {},
    );

    expect(byLocale).toEqual({ en: 8, fr: 3 });
  });

  it('pairs the two translated articles, each pair holding one English and one French', async () => {
    const { articles } = await read();
    const paired = articles.filter(
      (entry) => entry.translationId !== undefined,
    );

    const pairs = new Map<string, string[]>();
    for (const entry of paired) {
      const key = entry.translationId as string;
      pairs.set(key, [...(pairs.get(key) ?? []), entry.locale].sort());
    }

    expect(paired).toHaveLength(4);
    expect([...pairs.entries()].sort()).toEqual([
      ['gatsby-to-nextjs', ['en', 'fr']],
      ['yield-farming', ['en', 'fr']],
    ]);
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
describe('what the corpus lights up', () => {
  it('derives twenty-one content URLs, and no roll page in either locale', async () => {
    const pages = urlSet(urlScheme, await getArticleIndex());
    const built = pages.map((page) => buildUrl(urlScheme, page));

    expect([...built].sort()).toEqual([...URLS].sort());
    expect(built).toHaveLength(21);
    expect(built.filter((url) => url.includes('/p/'))).toEqual([]);
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
      to: '/l/fr/articles/c/theory/quel-langage-pour-progresser-dans-sa-carriere',
    });
    expect(
      of('/learn/fr/theory/s/quel-langage-pour-progresser-dans-sa-carriere'),
    ).toEqual({
      kind: 'permanent',
      to: '/l/fr/articles/c/theory/quel-langage-pour-progresser-dans-sa-carriere',
    });
  });

  it('lists every article at its unmarked source, and only the French ones twice', async () => {
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
