import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { localeRolls } from '../page-data/locale-rolls.ts';
import { pageCounterparts } from '../page-data/page-counterparts.ts';
import { rollPage } from '../page-data/roll-page.ts';
import { LOCALES } from '../routing/scheme.ts';
import type { PageUrl, RollUrl } from '../routing/url-scheme/index.ts';
import { listingHead } from '../listing/index.ts';
import { getPageCopy } from '../seopyramids.config.ts';
import { Route as LandingRoute } from './{-$locale}/index.tsx';
import { Route as BlogHomeRoute } from './{-$locale}/articles/index.tsx';
import { Route as BlogRollRoute } from './{-$locale}/articles/p/$n.tsx';
import { Route as CategoryRoute } from './{-$locale}/articles/c/$category/index.tsx';
import { Route as CategoryRollRoute } from './{-$locale}/articles/c/$category/p/$n.tsx';
import { Route as RootRoute } from './__root.tsx';
import { routeTree } from '../routeTree.gen.ts';

const getCounterparts = vi.hoisted(() =>
  vi.fn<(call: { data: PageUrl }) => Promise<PageUrl[]>>(),
);
const getRollPage = vi.hoisted(() =>
  vi.fn<(call: { data: RollUrl }) => Promise<unknown>>(),
);

/** The server function needs the Start runtime; its handler's own function answers in its place. */
vi.mock('../page-data/index.ts', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../page-data/index.ts')>()),
  getCounterparts,
  getNotesFeed: async () => [],
  getRollPage,
  getLocaleRolls: ({ data }: { data: { locale: string } }) => localeRolls(data),
}));

beforeEach(() => {
  getCounterparts.mockReset();
  getCounterparts.mockImplementation(({ data }) => pageCounterparts(data));
  getRollPage.mockReset();
  getRollPage.mockImplementation(({ data }) => rollPage(data));
});

const rollsOf = (locale: string) => localeRolls({ locale });

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

  // R-ROOTLOCALE-23: the unprefixed addresses are pages of the default Locale.
  it('reads the English landing page at / and the English content unprefixed', async () => {
    expect(await loadedAt('/')).toEqual({
      locale: 'en',
      counterparts: [
        { kind: 'landing', locale: 'fr' },
        { kind: 'landing', locale: 'es' },
      ],
      rolls: await rollsOf('en'),
    });
    expect(await loadedAt('/articles/c/web')).toMatchObject({ locale: 'en' });
  });

  it('gets the counterparts of the page from the page its address parses to', async () => {
    expect(await loadedAt('/articles/c/privacy/leaving-gmail')).toEqual({
      locale: 'en',
      counterparts: [
        {
          kind: 'article',
          locale: 'fr',
          category: 'privacy',
          slug: 'quitter-gmail',
        },
      ],
      rolls: await rollsOf('en'),
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
      rolls: await rollsOf('fr'),
    });
  });

  // R-BLOGROLLS-61: the footer's rolls, of the page's Locale.
  it('loads the rolls of the page’s Locale for the footer, none for Spanish', async () => {
    expect((await loadedAt('/fr')) as object).toMatchObject({
      rolls: await rollsOf('fr'),
    });
    expect(await loadedAt('/es')).toMatchObject({ rolls: [] });
    expect(
      ((await loadedAt('/articles/p/2')) as { rolls: unknown[] }).rolls,
    ).toHaveLength(6);
  });

  it('falls back to the default Locale and asks for no counterpart where the address names no page, the 404 page included', async () => {
    for (const pathname of ['/404', '/de', '/l/fr', '/en/fr'])
      expect(await loadedAt(pathname)).toEqual({
        locale: 'en',
        counterparts: [],
        rolls: await rollsOf('en'),
      });
    expect(getCounterparts).not.toHaveBeenCalled();
  });

  it('loads again on a client navigation, the new page carrying its own Locale and counterparts', async () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory({ initialEntries: ['/'] }),
      isServer: false,
      origin: 'http://localhost',
    });
    await router.load();
    await router.navigate({
      to: '/{-$locale}/articles/c/$category',
      params: { locale: 'fr', category: 'theory' },
    });

    expect(router.state.location.pathname).toBe('/fr/articles/c/theory');
    expect(router.state.matches[0].loaderData).toEqual({
      locale: 'fr',
      counterparts: [],
      rolls: await rollsOf('fr'),
    });
  });

  it('carries the English Locale and its counterparts to / reached by a client navigation from /fr', async () => {
    const router = clientRouterAt('/fr');
    await router.load();
    await router.navigate({ href: '/' });

    expect(router.state.location.pathname).toBe('/');
    expect(router.state.matches[0].loaderData).toEqual({
      locale: 'en',
      counterparts: [
        { kind: 'landing', locale: 'fr' },
        { kind: 'landing', locale: 'es' },
      ],
      rolls: await rollsOf('en'),
    });
  });

  it('carries the French counterpart of leaving-gmail reached by a client navigation from /fr', async () => {
    const router = clientRouterAt('/fr');
    await router.load();
    await router.navigate({ href: '/articles/c/privacy/leaving-gmail' });

    expect(router.state.location.pathname).toBe(
      '/articles/c/privacy/leaving-gmail',
    );
    expect(router.state.matches[0].loaderData).toMatchObject({
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
  });

  it('gives every page the title and the description of its Locale', async () => {
    for (const locale of LOCALES)
      expect(
        await headOf(RootRoute.options.head, { loaderData: { locale } }),
      ).toEqual(getPageCopy(locale).head);
  });
});

function clientRouterAt(path: string) {
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    isServer: false,
    origin: 'http://localhost',
  });
}

/** The ids of the routes the router matches at `path`, the root one aside. */
async function matchedRouteIds(path: string): Promise<string[]> {
  const router = clientRouterAt(path);
  await router.load();
  return router.state.matches
    .map((match) => match.routeId as string)
    .filter((id) => id !== '__root__');
}

/** A route that renders a page, as opposed to the root and the `{-$locale}` layout. */
const isPageRoute = (id: string) => id !== '__root__' && id !== '/{-$locale}';

// R-ROOTLOCALE-22: the layout route resolves the optional Locale segment.
describe('the route table under {-$locale}', () => {
  it('serves the English landing page at / and the other landing pages under their prefix', async () => {
    for (const path of ['/', '/fr', '/es']) {
      expect(await matchedRouteIds(path), path).toEqual([
        '/{-$locale}',
        '/{-$locale}/',
      ]);
    }
  });

  it('hands every route the resolved Locale, English when the segment is absent', async () => {
    const at = async (path: string) => {
      const router = clientRouterAt(path);
      await router.load();
      return router.state.matches.at(-1)?.params;
    };

    expect(await at('/')).toMatchObject({ locale: 'en' });
    expect(await at('/articles/c/web')).toMatchObject({
      locale: 'en',
      category: 'web',
    });
    expect(await at('/fr/articles/c/theory')).toMatchObject({
      locale: 'fr',
      category: 'theory',
    });
  });

  it('matches no page under the marked default Locale nor under an undeclared Locale, the router rendering its not-found page', async () => {
    for (const path of [
      '/en',
      '/en/articles',
      '/en/articles/c/blockchain',
      '/de',
      '/de/articles',
      '/FR',
    ]) {
      const router = clientRouterAt(path);
      await router.load();
      const { matches } = router.state;

      expect(
        matches.map((match) => match.routeId as string).filter(isPageRoute),
        path,
      ).toEqual([]);
      expect(
        matches.some((match) => (match as { _notFound?: boolean })._notFound),
        path,
      ).toBe(true);
    }
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

const LISTING_ROUTES = [
  {
    route: BlogHomeRoute,
    params: { locale: 'fr' },
    url: { kind: 'blog-home', locale: 'fr', page: 1 },
  },
  {
    route: BlogRollRoute,
    params: { locale: 'en', n: '2' },
    url: { kind: 'blog-home', locale: 'en', page: 2 },
  },
  {
    route: CategoryRoute,
    params: { locale: 'fr', category: 'theory' },
    url: { kind: 'category', locale: 'fr', category: 'theory', page: 1 },
  },
  {
    route: CategoryRollRoute,
    params: { locale: 'en', category: 'web', n: '3' },
    url: { kind: 'category', locale: 'en', category: 'web', page: 3 },
  },
] as const;

describe('the four listing routes', () => {
  it('take their head from listingHead, on the roll page their params name', async () => {
    for (const { route, params, url } of LISTING_ROUTES) {
      const { meta } = listingHead(url);

      expect(await headOf(route.options.head, { params })).toEqual({
        title: meta[0].title,
        description: meta[1].content,
      });
    }
  });

  it('load the roll page their params name through getRollPage', async () => {
    getRollPage.mockImplementation(async () => ({ locale: 'en', posts: [] }));

    for (const { route, params, url } of LISTING_ROUTES) {
      const loader = route.options.loader as unknown as (
        context: never,
      ) => unknown;
      await loader({ params } as never);

      expect(getRollPage).toHaveBeenLastCalledWith({ data: url });
    }
  });

  it('render the roll of the French blog home reached by a client navigation, its posts and no placeholder', async () => {
    const router = clientRouterAt('/fr');
    await router.load();
    await router.navigate({ href: '/fr/articles' });
    const match = router.state.matches.at(-1);

    expect(match?.routeId).toBe('/{-$locale}/articles/');
    expect(
      (match?.loaderData as unknown as { posts: unknown[] }).posts,
    ).toHaveLength(9);
  });
});
