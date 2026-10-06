import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

/** The markup an element renders inside a router at `path`, as the prerender writes it. */
export async function renderInRouter(
  element: ReactElement,
  path = '/',
): Promise<string> {
  const root = createRootRoute();
  const anyPage = createRoute({
    getParentRoute: () => root,
    path: '$',
    component: () => element,
  });
  const home = createRoute({
    getParentRoute: () => root,
    path: '/',
    component: () => element,
  });
  const router = createRouter({
    routeTree: root.addChildren([home, anyPage]),
    history: createMemoryHistory({ initialEntries: [path] }),
    isServer: true,
  });
  await router.load();

  return renderToString(<RouterProvider router={router} />);
}
