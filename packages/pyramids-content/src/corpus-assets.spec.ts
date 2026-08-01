import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import type { ArticleEntry, CorpusSpec } from './contract.js';
import { resolveAssetUrl } from './asset-reference.js';
import { copyCorpusAssets } from './copy-corpus-assets.js';
import { readCorpus } from './read-corpus.js';
import { article, writeCorpus } from '../test/corpus-fixture.js';

const ASSETS = {
  publishDir: '',
  urlPrefix: '/article-images',
};

const entry = (path: string): ArticleEntry =>
  ({ path }) as ArticleEntry;

const corpusOf = (root: string, publishDir = ''): CorpusSpec => ({
  root,
  localeFrom: 'frontmatter',
  assets: { ...ASSETS, publishDir },
});

const publishDirs: string[] = [];

async function freshPublishDir(): Promise<string> {
  const directory = join(
    await mkdtemp(join(tmpdir(), 'pyramids-assets-')),
    'article-images',
  );
  publishDirs.push(directory);
  return directory;
}

async function filesUnder(root: string): Promise<string[]> {
  const entries = await readdir(root, { recursive: true, withFileTypes: true });
  return entries
    .filter((found) => found.isFile())
    .map((found) =>
      relative(root, join(found.parentPath, found.name)).split(sep).join('/'),
    )
    .sort();
}

afterEach(async () => {
  await Promise.all(
    publishDirs.splice(0).map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

/**
 * R-MIGRATELEARN-22 and 24: the reference keeps the article-relative form it is
 * authored in, and the URL it resolves to is derived from the file's place in
 * the corpus rather than from the page's place in the URL scheme. An article
 * that changes category therefore moves no image.
 */
describe('resolveAssetUrl', () => {
  const corpus = corpusOf('/repo/content/articles');

  it('joins a sibling reference onto the article’s own directory', () => {
    expect(
      resolveAssetUrl(corpus, entry('blockchain/ledger-versus-metamask.md'), './images/vpn.png'),
    ).toBe('/article-images/blockchain/images/vpn.png');
  });

  it('resolves a reference climbing to the shared folder at the corpus root', () => {
    expect(
      resolveAssetUrl(corpus, entry('javascript/styled-components.md'), '../images/styled-logo.png'),
    ).toBe('/article-images/images/styled-logo.png');
  });

  it('resolves a reference carrying no prefix at all', () => {
    expect(resolveAssetUrl(corpus, entry('privacy/leaving-gmail.md'), 'images/gmail.png')).toBe(
      '/article-images/privacy/images/gmail.png',
    );
  });

  it('keeps the case of a path a filesystem distinguishes', () => {
    expect(resolveAssetUrl(corpus, entry('theory/quel-second-langage.md'), './images/M87.jpg')).toBe(
      '/article-images/theory/images/M87.jpg',
    );
  });

  it('passes an absolute reference through untouched', () => {
    expect(resolveAssetUrl(corpus, entry('web/sonoff.md'), '/logo.png')).toBe('/logo.png');
  });

  it('passes an external reference through untouched', () => {
    expect(
      resolveAssetUrl(corpus, entry('web/sonoff.md'), 'https://example.test/a.png'),
    ).toBe('https://example.test/a.png');
  });

  it('resolves against the corpus and never against the URL an article is served at', () => {
    const inRoot = resolveAssetUrl(corpus, entry('sonoff.md'), './images/a.png');
    const nested = resolveAssetUrl(corpus, entry('web/deep/sonoff.md'), './images/a.png');

    expect(inRoot).toBe('/article-images/images/a.png');
    expect(nested).toBe('/article-images/web/deep/images/a.png');
  });
});

/**
 * R-MIGRATELEARN-23: a reference the corpus cannot answer is a violation naming
 * the article and the reference, so `yarn emit:redirects` fails before a page or
 * an asset is produced. It is raised over unpublished files too, so an image
 * deleted while an article is out of the index does not surface the day the flag
 * comes back.
 */
describe('the unresolved-asset violation', () => {
  const withAssets = async (files: Record<string, string>) =>
    readCorpus(corpusOf(await writeCorpus(files)));

  const published = (yaml: string, body: string) =>
    article(`${yaml}\npublished: true`, { body });

  it('raises nothing when every reference resolves to a file the corpus holds', async () => {
    const { violations } = await withAssets({
      'blockchain/ledger.md': published(
        'title: Ledger\nlocale: en\ndate: "2022-01-20"\nimage: ./images/cover.png',
        '![vpn](./images/vpn.png)',
      ),
      'blockchain/images/cover.png': 'PNG',
      'blockchain/images/vpn.png': 'PNG',
    });

    expect(violations).toEqual([]);
  });

  it('names the article and the reference when a body image resolves to no file', async () => {
    const { violations } = await withAssets({
      'blockchain/ledger.md': published(
        'title: Ledger\nlocale: en\ndate: "2022-01-20"',
        '![vpn](./images/vpn.png)',
      ),
    });

    expect(violations).toEqual([
      { code: 'unresolved-asset', path: 'blockchain/ledger.md', reference: './images/vpn.png' },
    ]);
  });

  it('raises the same violation for a cover image the corpus does not hold', async () => {
    const { violations } = await withAssets({
      'javascript/typescript/completes-with.md': published(
        'title: Completes\nlocale: en\ndate: "2021-05-23"\nimage: ./images/stop.png',
        'No body image.',
      ),
      'javascript/images/stop.png': 'PNG',
    });

    expect(violations).toEqual([
      {
        code: 'unresolved-asset',
        path: 'javascript/typescript/completes-with.md',
        reference: './images/stop.png',
      },
    ]);
  });

  it('refuses a reference escaping the corpus root, whatever sits there', async () => {
    const { violations } = await withAssets({
      'web/sonoff.md': published(
        'title: Sonoff\nlocale: en\ndate: "2021-01-04"',
        '![up](../../secrets/key.png)',
      ),
    });

    expect(violations).toEqual([
      { code: 'unresolved-asset', path: 'web/sonoff.md', reference: '../../secrets/key.png' },
    ]);
  });

  it('validates an unpublished file too, so a flag added later reveals nothing', async () => {
    const { violations, unpublished } = await withAssets({
      'web/draft.md': article('title: Draft\nlocale: en\ndate: "2021-01-04"', {
        body: '![gone](./images/gone.png)',
      }),
    });

    expect(unpublished).toEqual(['web/draft.md']);
    expect(violations).toEqual([
      { code: 'unresolved-asset', path: 'web/draft.md', reference: './images/gone.png' },
    ]);
  });

  it('judges no reference when the corpus declares no asset root', async () => {
    const root = await writeCorpus({
      'web/sonoff.md': published('title: Sonoff\nlocale: en\ndate: "2021-01-04"', '![a](./x.png)'),
    });

    const { violations } = await readCorpus({ root, localeFrom: 'frontmatter' });

    expect(violations).toEqual([]);
  });

  it('lets an absolute or external reference through without looking for a file', async () => {
    const { violations } = await withAssets({
      'web/sonoff.md': published(
        'title: Sonoff\nlocale: en\ndate: "2021-01-04"',
        '![a](/public.png)\n\n![b](https://example.test/b.png)',
      ),
    });

    expect(violations).toEqual([]);
  });
});

/**
 * R-MIGRATELEARN-21 and 28: the step publishes what the published articles
 * reference and nothing else, and it owns the directory it writes — the tree is
 * produced in full on every run, so a renamed or deleted image cannot survive as
 * a stale public file.
 */
describe('copyCorpusAssets', () => {
  it('publishes the referenced files at their corpus-relative paths', async () => {
    const root = await writeCorpus({
      'blockchain/ledger.md': article(
        'title: Ledger\nlocale: en\ndate: "2022-01-20"\nimage: ./images/cover.png\npublished: true',
        { body: '![vpn](./images/vpn.png)' },
      ),
      'javascript/styled.md': article(
        'title: Styled\nlocale: en\ndate: "2020-11-05"\nimage: ../images/logo.png\npublished: true',
        { body: 'No body image.' },
      ),
      'blockchain/images/cover.png': 'PNG',
      'blockchain/images/vpn.png': 'PNG',
      'images/logo.png': 'PNG',
    });
    const publishDir = await freshPublishDir();

    const copied = await copyCorpusAssets(corpusOf(root, publishDir));

    expect([...copied].sort()).toEqual([
      'blockchain/images/cover.png',
      'blockchain/images/vpn.png',
      'images/logo.png',
    ]);
    expect(await filesUnder(publishDir)).toEqual([
      'blockchain/images/cover.png',
      'blockchain/images/vpn.png',
      'images/logo.png',
    ]);
  });

  it('leaves behind an image no published article references', async () => {
    const root = await writeCorpus({
      'web/sonoff.md': article(
        'title: Sonoff\nlocale: en\ndate: "2021-01-04"\nimage: ./images/used.png\npublished: true',
        { body: 'No body image.' },
      ),
      'web/draft.md': article('title: Draft\nlocale: en\ndate: "2021-01-05"', {
        body: '![d](./images/drafted.png)',
      }),
      'web/images/used.png': 'PNG',
      'web/images/drafted.png': 'PNG',
      'security/images/locker.png': 'PNG',
    });
    const publishDir = await freshPublishDir();

    await copyCorpusAssets(corpusOf(root, publishDir));

    expect(await filesUnder(publishDir)).toEqual(['web/images/used.png']);
  });

  it('creates the directory it owns, on a checkout that carries none', async () => {
    const root = await writeCorpus({
      'web/sonoff.md': article(
        'title: Sonoff\nlocale: en\ndate: "2021-01-04"\nimage: ./images/a.png\npublished: true',
        { body: 'No body image.' },
      ),
      'web/images/a.png': 'PNG',
    });
    const publishDir = join(await freshPublishDir(), 'never-checked-out');

    await copyCorpusAssets(corpusOf(root, publishDir));

    expect(await filesUnder(publishDir)).toEqual(['web/images/a.png']);
  });

  /**
   * The failure mode v1's hand-kept `public/learn/**` mirror is living proof of:
   * four names the mirror holds and the corpus does not. Republishing a corpus
   * whose image was renamed must leave the old name nowhere.
   */
  it('leaves nothing behind when an image is renamed and the corpus republished', async () => {
    const root = await writeCorpus({
      'web/sonoff.md': article(
        'title: Sonoff\nlocale: en\ndate: "2021-01-04"\nimage: ./images/old.png\npublished: true',
        { body: 'No body image.' },
      ),
      'web/images/old.png': 'PNG',
    });
    const publishDir = await freshPublishDir();
    await copyCorpusAssets(corpusOf(root, publishDir));

    const renamed = await writeCorpus({
      'web/sonoff.md': article(
        'title: Sonoff\nlocale: en\ndate: "2021-01-04"\nimage: ./images/new.png\npublished: true',
        { body: 'No body image.' },
      ),
      'web/images/new.png': 'PNG',
    });
    await copyCorpusAssets(corpusOf(renamed, publishDir));

    expect(await filesUnder(publishDir)).toEqual(['web/images/new.png']);
  });

  it('publishes one file once, however many articles reference it', async () => {
    const root = await writeCorpus({
      'a.md': article(
        'title: A\nlocale: en\ndate: "2021-01-04"\nimage: ./images/shared.png\npublished: true',
        { body: '![s](./images/shared.png)' },
      ),
      'b.md': article(
        'title: B\nlocale: en\ndate: "2021-01-05"\nimage: ./images/shared.png\npublished: true',
        { body: 'No body image.' },
      ),
      'images/shared.png': 'PNG',
    });
    const publishDir = await freshPublishDir();

    const copied = await copyCorpusAssets(corpusOf(root, publishDir));

    expect(copied).toEqual(['images/shared.png']);
  });

  it('publishes nothing, and no directory, when the corpus declares no asset root', async () => {
    const root = await writeCorpus({
      'a.md': article(
        'title: A\nlocale: en\ndate: "2021-01-04"\nimage: ./images/a.png\npublished: true',
        { body: 'No body image.' },
      ),
      'images/a.png': 'PNG',
    });

    const copied = await copyCorpusAssets({ root, localeFrom: 'frontmatter' });

    expect(copied).toEqual([]);
  });

  it('publishes the file an absolute reference names nowhere, that URL being the site’s own', async () => {
    const root = await writeCorpus({
      'a.md': article(
        'title: A\nlocale: en\ndate: "2021-01-04"\nimage: /brand/logo.png\npublished: true',
        { body: '![e](https://example.test/e.png)' },
      ),
    });
    const publishDir = await freshPublishDir();

    const copied = await copyCorpusAssets(corpusOf(root, publishDir));

    expect(copied).toEqual([]);
    expect(await filesUnder(publishDir)).toEqual([]);
  });
});
