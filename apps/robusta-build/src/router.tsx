/**
 * Package routes — the route tree TanStack Start mounts and prerenders, and the
 * router that holds it.
 *
 * Design: features/pyramid-v2-epic/__done/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-43, R-TANSTACK-44, R-TANSTACK-46, R-TANSTACK-47, R-TANSTACK-49, R-TANSTACK-81, R-TANSTACK-82, R-TANSTACK-83, R-TANSTACK-84
 * Design: features/pyramid-v2-epic/__done/robusta-landing-page/robusta-landing-page.design.md
 * Requirements: R-LANDING-61, R-LANDING-81
 * Design: features/pyramid-v2-epic/__done/multilingual-site/multilingual-site.design.md
 * Requirements: R-MULTILINGUAL-28, R-MULTILINGUAL-42, R-MULTILINGUAL-45, R-MULTILINGUAL-62
 * Design: features/pyramid-v2-epic/__done/default-locale-at-root/default-locale-at-root.design.md
 * Requirements: R-ROOTLOCALE-21, R-ROOTLOCALE-22, R-ROOTLOCALE-23, R-ROOTLOCALE-61
 * Design: features/pyramid-v2-epic/__done/blog-rolls/blog-rolls.design.md
 * Requirements: R-BLOGROLLS-26, R-BLOGROLLS-61
 * Design: features/pyramid-v2-epic/__done/seo-excellence/seo-excellence.design.md
 * Requirements: R-SEOEXCELLENCE-01, R-SEOEXCELLENCE-24
 */
import { createRouter } from '@tanstack/react-router';
import { NavigationFailure } from './components/NavigationFailure.tsx';
import { NotFoundPage } from './components/NotFoundPage.tsx';
import { routeTree } from './routeTree.gen.ts';

/** The router over the generated route tree, with the site's not-found and failure states. */
export function getRouter() {
  return createRouter({
    routeTree,
    defaultNotFoundComponent: NotFoundPage,
    defaultErrorComponent: NavigationFailure,
    scrollRestoration: true,
  });
}
