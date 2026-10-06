import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';

/** The markup an element renders inside a router at `/`, as the prerender writes it. */
export async function renderInRouter(element: ReactElement): Promise<string> {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => element }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
    isServer: true,
  });
  await router.load();

  return renderToString(<RouterProvider router={router} />);
}
