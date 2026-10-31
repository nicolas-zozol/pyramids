import colorsAndTypeCss from '@robusta/pyramids-design-system/colors_and_type.css?url';
import sketchCss from '@robusta/pyramids-design-system/sketch.css?url';
import {
  createRootRoute,
  HeadContent,
  Scripts,
  useMatches,
} from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { Footer, Header } from '@/chrome/index.js';
import { getCounterparts } from '@/page-data/index.js';
import { urlScheme } from '@/routing/scheme.js';
import { parseUrl } from '@/routing/url-scheme/index.js';
import { getPageCopy } from '@/seopyramids.config.js';
import fontsCss from '@/styles/fonts.css?url';
import globalsCss from '@/styles/globals.css?url';

// Load order is a contract: Tailwind's preflight sits in `@layer base`, the
// design system's element rules are unlayered and win, and `sketch.css` reads
// the tokens `colors_and_type.css` defines.
const STYLESHEETS = [fontsCss, globalsCss, colorsAndTypeCss, sketchCss];

export const Route = createRootRoute({
  // The root match stays across client navigations and would keep the first
  // page's Locale and counterparts: it reloads, and the new page waits for it.
  shouldReload: true,
  loader: {
    staleReloadMode: 'blocking',
    handler: async ({ location }) => {
      const page = parseUrl(urlScheme, location.pathname);
      return {
        locale: page?.locale ?? urlScheme.defaultLocale,
        counterparts:
          page === undefined ? [] : await getCounterparts({ data: page }),
      };
    },
  },
  head: ({ loaderData }) => {
    const { title, description } = getPageCopy(
      loaderData?.locale ?? urlScheme.defaultLocale,
    ).head;
    return {
      meta: [
        { charSet: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { title },
        { name: 'description', content: description },
        { name: 'robots', content: 'noindex, nofollow' },
      ],
      links: STYLESHEETS.map((href) => ({ rel: 'stylesheet', href })),
    };
  },
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  const { locale, counterparts } = Route.useLoaderData();
  const isNotFoundDocument = useMatches({
    select: (matches) => matches.some((match) => match.routeId === '/404'),
  });

  return (
    <html lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body>
        <Header locale={locale} counterparts={counterparts} />
        {children}
        <Footer locale={locale} />
        {isNotFoundDocument ? null : <Scripts />}
      </body>
    </html>
  );
}
