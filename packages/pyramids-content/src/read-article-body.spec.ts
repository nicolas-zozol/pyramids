import { describe, expect, it } from 'vitest';
import { article, writeCorpus } from '../test/corpus-fixture.js';
import type { CorpusSpec } from './contract.js';
import { readArticleBody } from './read-article-body.js';
import { readCorpus } from './read-corpus.js';

function spec(root: string): CorpusSpec {
  return { root, localeFrom: 'frontmatter' };
}

const FRONTMATTER = `title: 'Ledger versus Metamask'\nlocale: 'en'\ndate: '2022-01-20'\npublished: true`;

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
        'a.md': article(FRONTMATTER, { excerpt: 'The lede.', body: 'The rest.' }),
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
          `title: 'Second'\nlocale: 'en'\ndate: '2022-01-21'\npublished: true`,
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
