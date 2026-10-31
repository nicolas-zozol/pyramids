import { describe, expect, it } from 'vitest';
import { urlScheme } from '../routing/scheme.js';
import { buildUrl, parseUrl } from '../routing/url-scheme/index.js';
import { pageCounterparts } from './page-counterparts.js';

async function counterpartsAt(path: string): Promise<string[]> {
  const page = parseUrl(urlScheme, path);
  if (page === undefined) throw new Error(`${path} is no URL of the scheme`);
  return (await pageCounterparts(page)).map((counterpart) =>
    buildUrl(urlScheme, counterpart),
  );
}

/** The counterparts `getCounterparts` writes to a data file per page, on the site's own corpus. */
describe('pageCounterparts', () => {
  it('ties leaving-gmail and quitter-gmail to each other, and to no Spanish page', async () => {
    expect(
      await counterpartsAt('/en/articles/c/privacy/leaving-gmail'),
    ).toEqual(['/fr/articles/c/privacy/quitter-gmail']);
    expect(
      await counterpartsAt('/fr/articles/c/privacy/quitter-gmail'),
    ).toEqual(['/en/articles/c/privacy/leaving-gmail']);
  });

  it('gives a landing page the landing page of each other Locale', async () => {
    expect(await counterpartsAt('/fr')).toEqual(['/en', '/es']);
  });

  it('gives the French blog home the English one, Spanish having none', async () => {
    expect(await counterpartsAt('/fr/articles')).toEqual(['/en/articles']);
  });

  it('gives theory, claimed by French articles only, no counterpart', async () => {
    expect(await counterpartsAt('/fr/articles/c/theory')).toEqual([]);
  });

  it('gives a Category both Locales claim the other one', async () => {
    expect(await counterpartsAt('/fr/articles/c/privacy')).toEqual([
      '/en/articles/c/privacy',
    ]);
  });

  it('gives a tag page none', async () => {
    expect(
      await pageCounterparts({
        kind: 'tag',
        locale: 'fr',
        tag: 'css',
        page: 1,
      }),
    ).toEqual([]);
  });
});
