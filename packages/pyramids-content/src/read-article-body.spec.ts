import { describe, expect, it } from 'vitest';
import { article, writeCorpus } from '../test/corpus-fixture.js';
import type { CorpusSpec } from './contract.js';
import { readArticleBody } from './read-article-body.js';
import { readCorpus } from './read-corpus.js';

function spec(root: string): CorpusSpec {
  return { root, localeFrom: 'frontmatter' };
}

/** A site that publishes its images, which is what makes a reference resolvable. */
function publishing(root: string): CorpusSpec {
  return {
    ...spec(root),
    assets: {
      publishDir: 'public/article-images',
      urlPrefix: '/article-images',
    },
  };
}

async function bodyOf(corpus: CorpusSpec, path: string): Promise<string> {
  const { articles } = await readCorpus(corpus);
  const entry = articles.find((found) => found.path === path);
  return (await readArticleBody(corpus, entry as (typeof articles)[number]))
    .html;
}

const FRONTMATTER = `title: 'Ledger versus Metamask'\nlocale: 'en'\ndate: '2022-01-20'\nauthor: 'Nina'\npublished: true`;

describe('readArticleBody', () => {
  it('renders the markdown body to HTML and carries no frontmatter into it', async () => {
    const corpus = spec(
      await writeCorpus({
        'blockchain/ledger.md': article(FRONTMATTER, {
          body: '## Signing\n\nA hardware wallet **signs** offline.',
        }),
      }),
    );
    const { articles } = await readCorpus(corpus);

    const { html } = await readArticleBody(corpus, articles[0]);

    expect(html).toContain('<h2>Signing</h2>');
    expect(html).toContain('<strong>signs</strong>');
    expect(html).not.toContain('Ledger versus Metamask');
  });

  it('renders the opening block with the body, as the article reads on the page', async () => {
    const corpus = spec(
      await writeCorpus({
        'a.md': article(FRONTMATTER, {
          excerpt: 'The lede.',
          body: 'The rest.',
        }),
      }),
    );
    const { articles } = await readCorpus(corpus);

    const { html } = await readArticleBody(corpus, articles[0]);

    expect(html).toContain('The lede.');
    expect(html).toContain('The rest.');
  });

  it('resolves the file from the entry it is given, not from a second lookup by slug', async () => {
    const corpus = spec(
      await writeCorpus({
        'first.md': article(FRONTMATTER, { body: 'The first body.' }),
        'second.md': article(
          `title: 'Second'\nlocale: 'en'\ndate: '2022-01-21'\nauthor: 'Nina'\npublished: true`,
          { body: 'The second body.' },
        ),
      }),
    );
    const { articles } = await readCorpus(corpus);
    const first = articles.find((entry) => entry.path === 'first.md');

    const { html } = await readArticleBody(corpus, {
      ...(first as (typeof articles)[number]),
      path: 'second.md',
    });

    expect(html).toContain('The second body.');
  });
});

/**
 * R-ARTICLEPAGE-21. The body is the third caller `resolveAssetUrl` was written
 * for: validation judges a reference through it, the copy step publishes a file
 * through it, and the rendered body now links through it. A site restating the
 * rule over the HTML string is the drift the resolver exists to prevent, so the
 * resolution runs on the syntax tree, once, inside the base.
 */
describe('readArticleBody — the image references the body carries', () => {
  it('serves an article-relative reference from the asset root', async () => {
    const corpus = publishing(
      await writeCorpus({
        'blockchain/ledger.md': article(FRONTMATTER, {
          body: '![the vault](./images/vault.png)',
        }),
        'blockchain/images/vault.png': 'PNG',
      }),
    );

    const html = await bodyOf(corpus, 'blockchain/ledger.md');

    expect(html).toContain(
      '<img src="/article-images/blockchain/images/vault.png" alt="the vault">',
    );
  });

  it('resolves a reference climbing to a folder the articles share', async () => {
    const corpus = publishing(
      await writeCorpus({
        'javascript/styled.md': article(FRONTMATTER, {
          body: '![logo](../images/styled-logo.png)',
        }),
        'images/styled-logo.png': 'PNG',
      }),
    );

    const html = await bodyOf(corpus, 'javascript/styled.md');

    expect(html).toContain('src="/article-images/images/styled-logo.png"');
  });

  it('leaves an external, protocol-relative or site-absolute reference as its author wrote it', async () => {
    const corpus = publishing(
      await writeCorpus({
        'a.md': article(FRONTMATTER, {
          body: [
            '![remote](https://example.test/remote.png)',
            '![cdn](//cdn.example.test/cdn.png)',
            '![own](/brand/logo.png)',
          ].join('\n\n'),
        }),
      }),
    );

    const html = await bodyOf(corpus, 'a.md');

    expect(html).toContain('src="https://example.test/remote.png"');
    expect(html).toContain('src="//cdn.example.test/cdn.png"');
    expect(html).toContain('src="/brand/logo.png"');
  });

  /** AC-ARTICLEPAGE-03: a site publishing no asset renders what it renders today. */
  it('renders every reference as written when the corpus declares no assets', async () => {
    const corpus = spec(
      await writeCorpus({
        'blockchain/ledger.md': article(FRONTMATTER, {
          body: '![the vault](./images/vault.png)',
        }),
      }),
    );

    const html = await bodyOf(corpus, 'blockchain/ledger.md');

    expect(html).toContain('src="./images/vault.png"');
  });

  it('resolves an image written as a reference through the definition it names', async () => {
    const corpus = publishing(
      await writeCorpus({
        'blockchain/ledger.md': article(FRONTMATTER, {
          body: '![the vault][vault]\n\n[vault]: ./images/vault.png',
        }),
        'blockchain/images/vault.png': 'PNG',
      }),
    );

    const html = await bodyOf(corpus, 'blockchain/ledger.md');

    expect(html).toContain('src="/article-images/blockchain/images/vault.png"');
  });

  it('leaves a link alone, a link to a file being no image reference', async () => {
    const corpus = publishing(
      await writeCorpus({
        'blockchain/ledger.md': article(FRONTMATTER, {
          body: '[the vault](./images/vault.png)',
        }),
        'blockchain/images/vault.png': 'PNG',
      }),
    );

    const html = await bodyOf(corpus, 'blockchain/ledger.md');

    expect(html).toContain('href="./images/vault.png"');
  });

  it('hands the page a body carrying no article-relative reference at all', async () => {
    const corpus = publishing(
      await writeCorpus({
        'blockchain/ledger.md': article(FRONTMATTER, {
          body: '![one](./images/one.png)\n\n![two](images/two.png)\n\n![three](../images/three.png)',
        }),
        'blockchain/images/one.png': 'PNG',
        'blockchain/images/two.png': 'PNG',
        'images/three.png': 'PNG',
      }),
    );

    const html = await bodyOf(corpus, 'blockchain/ledger.md');

    expect(html).not.toMatch(/src="(?!\/|[a-z][a-z0-9+.-]*:)/i);
    expect(html.match(/src="[^"]*"/g)).toEqual([
      'src="/article-images/blockchain/images/one.png"',
      'src="/article-images/blockchain/images/two.png"',
      'src="/article-images/images/three.png"',
    ]);
  });
});

/**
 * R-ARTICLEPAGE-26 and 27. remark-html 16 sanitizes by default, and that default
 * is kept: `allowDangerousHtml` stays off, so an image written as raw HTML is
 * dropped whole rather than resolved, and emphasis written as a tag renders as
 * its text alone. Asserted here because it is the behaviour a publisher meets,
 * and the one a later change to the pipeline would silently undo.
 */
describe('readArticleBody — what the sanitizer leaves', () => {
  it('drops an image written as raw HTML rather than resolving it', async () => {
    const corpus = publishing(
      await writeCorpus({
        'blockchain/ledger.md': article(FRONTMATTER, {
          body: '<img src="./images/vault.png" alt="the vault">',
        }),
        'blockchain/images/vault.png': 'PNG',
      }),
    );

    const html = await bodyOf(corpus, 'blockchain/ledger.md');

    expect(html).not.toContain('<img');
    expect(html).not.toContain('vault.png');
  });

  it('keeps the text of an inline tag and loses its markup', async () => {
    const corpus = spec(
      await writeCorpus({
        'a.md': article(FRONTMATTER, {
          body: 'clairement <u>le</u> langage à la mode',
        }),
      }),
    );

    const html = await bodyOf(corpus, 'a.md');

    expect(html).toContain('clairement le langage à la mode');
    expect(html).not.toContain('<u>');
  });

  it('leaves the language class of a fenced block on the code element', async () => {
    const corpus = spec(
      await writeCorpus({
        'a.md': article(FRONTMATTER, { body: '```js\nconst a = 1;\n```' }),
      }),
    );

    const html = await bodyOf(corpus, 'a.md');

    expect(html).toContain('<pre><code class="language-js">');
  });
});
