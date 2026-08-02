import { describe, expect, it } from 'vitest';
import { article, writeCorpus } from '../test/corpus-fixture.js';
import { readCorpus } from './read-corpus.js';

/**
 * AC-CONTENTSOURCE-21 and R-CONTENTSOURCE-24: a tree that carries its locale in
 * the path uses the same contract with no code forked into a site. The shape is
 * dakar's — `content/{locale}/guide/{slug}.md`, with `.brief.md` companions
 * beside the articles — and the only thing that differs from the robusta corpus
 * is the `CorpusSpec` the site declares.
 */
const guide = (title: string, date: string) =>
  article(
    `title: '${title}'\ndate: '${date}'\ncategory: guide\nauthor: 'Nina'\npublished: true`,
  );

describe('a corpus carrying its locale in the path', () => {
  it('returns every article with the locale of its declared path segment', async () => {
    const root = await writeCorpus({
      'en/guide/hossegor.md': guide('Hossegor', '2024-06-01'),
      'en/guide/lacanau.md': guide('Lacanau', '2024-06-02'),
      'fr/guide/hossegor.md': guide('Hossegor la gauche', '2024-06-03'),
    });

    const { articles, violations } = await readCorpus({
      root,
      localeFrom: { pathSegment: 0 },
    });

    expect(violations).toEqual([]);
    expect(
      articles.map((entry) => `${entry.locale} ${entry.slug}`).sort(),
    ).toEqual(['en hossegor', 'en lacanau', 'fr hossegor-la-gauche']);
  });

  it('leaves out the companions the corpus declares as exclusions', async () => {
    const root = await writeCorpus({
      'en/guide/hossegor.md': guide('Hossegor', '2024-06-01'),
      'en/guide/hossegor.brief.md': guide('Hossegor brief', '2024-06-01'),
      'fr/guide/lacanau.brief.md': guide('Lacanau brief', '2024-06-02'),
    });

    const { articles, violations } = await readCorpus({
      root,
      localeFrom: { pathSegment: 0 },
      exclude: ['.brief.md'],
    });

    expect(violations).toEqual([]);
    expect(articles.map((entry) => entry.path)).toEqual([
      'en/guide/hossegor.md',
    ]);
  });

  it('names the file whose path carries no segment where the locale was declared to be', async () => {
    const root = await writeCorpus({
      'loose.md': guide('Loose', '2024-06-01'),
    });

    const { violations } = await readCorpus({
      root,
      localeFrom: { pathSegment: 1 },
    });

    expect(violations).toEqual([
      { code: 'missing-field', path: 'loose.md', field: 'locale' },
    ]);
  });

  it('takes the locale from the path even when the frontmatter declares another', async () => {
    const root = await writeCorpus({
      'fr/guide/lacanau.md': article(
        `title: 'Lacanau'\nlocale: 'en'\ndate: '2024-06-01'\nauthor: 'Nina'\npublished: true`,
      ),
    });

    const { articles } = await readCorpus({
      root,
      localeFrom: { pathSegment: 0 },
    });

    expect(articles[0].locale).toBe('fr');
  });
});
