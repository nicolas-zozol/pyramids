/**
 * Package routes — the route tree TanStack Start mounts and prerenders, and the
 * router that holds it.
 *
 * Design: features/pyramid-v2-epic/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-41, R-TANSTACK-42, R-TANSTACK-43, R-TANSTACK-44, R-TANSTACK-46, R-TANSTACK-47, R-TANSTACK-49, R-TANSTACK-81, R-TANSTACK-82, R-TANSTACK-83, R-TANSTACK-84
 */
import { createRouter } from '@tanstack/react-router';
import { NavigationFailure } from './components/NavigationFailure.js';
import { NotFoundPage } from './components/NotFoundPage.js';
import { routeTree } from './routeTree.gen.js';

/** The router over the generated route tree, with the site's not-found and failure states. */
export function getRouter() {
  return createRouter({
    routeTree,
    defaultNotFoundComponent: NotFoundPage,
    defaultErrorComponent: NavigationFailure,
    scrollRestoration: true,
  });
}
