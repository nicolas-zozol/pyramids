import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { pageCounterparts } from '../page-data/page-counterparts.ts';
import { LOCALES } from '../routing/scheme.ts';
import type { PageUrl } from '../routing/url-scheme/index.ts';
import { getPageCopy } from '../seopyramids.config.ts';
import { Route as LandingRoute } from './$locale/index.tsx';
import { Route as RootRoute } from './__root.tsx';
import { routeTree } from '../routeTree.gen.ts';

const getCounterparts = vi.hoisted(() =>
  vi.fn<(call: { data: PageUrl }) => Promise<PageUrl[]>>(),
);

/** The server function needs the Start runtime; its handler's own function answers in its place. */
vi.mock('../page-data/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../page-data/index.ts')>()),
  getCounterparts,
  getNotesFeed: async () => [],
}));

beforeEach(() => {
  getCounterparts.mockReset();
  getCounterparts.mockImplementation(({ data }) => pageCounterparts(data));
});

interface Meta {
  title?: string;
  name?: string;
  content?: string;
}

async function headOf(
  head: ((context: never) => unknown) | undefined,
  context: object,
): Promise<{ title?: string; description?: string }> {
  const { meta = [] } = ((await head?.(context as never)) ?? {}) as {
    meta?: Meta[];
  };
  return {
    title: meta.find((tag) => tag.title !== undefined)?.title,
    description: meta.find((tag) => tag.name === 'description')?.content,
  };
}

const rootLoader = (
  RootRoute.options.loader as unknown as {
    handler: (context: never) => unknown;
  }
).handler;
const loadedAt = async (pathname: string) =>
  rootLoader({ location: { pathname } } as never);

describe('the root route', () => {
  it('reads the Locale of the page from its address', async () => {
    expect(await loadedAt('/fr')).toMatchObject({ locale: 'fr' });
    expect(await loadedAt('/es')).toMatchObject({ locale: 'es' });
    expect(
      await loadedAt('/fr/articles/c/theory/quel-second-langage'),
    ).toMatchObject({ locale: 'fr' });
  });

  it('gets the counterparts of the page from the page its address parses to', async () => {
    expect(await loadedAt('/en/articles/c/privacy/leaving-gmail')).toEqual({
      locale: 'en',
      counterparts: [
        {
          kind: 'article',
          locale: 'fr',
          category: 'privacy',
          slug: 'quitter-gmail',
        },
      ],
    });
    expect(getCounterparts).toHaveBeenCalledWith({
      data: {
        kind: 'article',
        locale: 'en',
        category: 'privacy',
        slug: 'leaving-gmail',
      },
    });
    expect(await loadedAt('/fr/articles/c/theory')).toEqual({
      locale: 'fr',
      counterparts: [],
    });
  });

  it('falls back to the default Locale and asks for no counterpart where the address names no page, the 404 page included', async () => {
    for (const pathname of ['/404', '/de', '/articles/c/blockchain'])
      expect(await loadedAt(pathname)).toEqual({
        locale: 'en',
        counterparts: [],
      });
    expect(getCounterparts).not.toHaveBeenCalled();
  });

  it('loads again on a client navigation, the new page carrying its own Locale and counterparts', async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/en'] }),
      isServer: false,
      origin: 'http://localhost',
    });
    await router.load();
    await router.navigate({
      to: '/$locale/articles/c/$category',
      params: { locale: 'fr', category: 'theory' },
    });

    expect(router.state.location.pathname).toBe('/fr/articles/c/theory');
    expect(router.state.matches[0].loaderData).toEqual({
      locale: 'fr',
      counterparts: [],
    });
  });

  it('gives every page the title and the description of its Locale', async () => {
    for (const locale of LOCALES)
      expect(
        await headOf(RootRoute.options.head, { loaderData: { locale } }),
      ).toEqual(getPageCopy(locale).head);
  });
});

describe('the landing route', () => {
  it('gives each landing page the title and the description of its Locale’s landing copy', async () => {
    for (const locale of LOCALES)
      expect(
        await headOf(LandingRoute.options.head, { params: { locale } }),
      ).toEqual(getPageCopy(locale).landing.head);
  });
});
