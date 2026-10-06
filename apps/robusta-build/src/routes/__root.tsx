import colorsAndTypeCss from '@robusta/pyramids-design-system/colors_and_type.css?url';
import sketchCss from '@robusta/pyramids-design-system/sketch.css?url';
import {
  createRootRoute,
  HeadContent,
  Scripts,
  useMatches,
  useParams,
} from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { urlScheme } from '@/routing/scheme.js';
import { getSeoPyramidsConfig } from '@/seopyramids.config.js';
import fontsCss from '@/styles/fonts.css?url';
import globalsCss from '@/styles/globals.css?url';

const config = getSeoPyramidsConfig();

// Load order is a contract: Tailwind's preflight sits in `@layer base`, the
// design system's element rules are unlayered and win, and `sketch.css` reads
// the tokens `colors_and_type.css` defines.
const STYLESHEETS = [fontsCss, globalsCss, colorsAndTypeCss, sketchCss];

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: config.siteTitle },
      ...(config.mission === undefined
        ? []
        : [{ name: 'description', content: config.mission }]),
      { name: 'robots', content: 'noindex, nofollow' },
    ],
    links: STYLESHEETS.map((href) => ({ rel: 'stylesheet', href })),
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
  const { locale } = useParams({ strict: false });
  const isNotFoundDocument = useMatches({
    select: (matches) => matches.some((match) => match.routeId === '/404'),
  });

  return (
    <html lang={locale ?? urlScheme.defaultLocale}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        {isNotFoundDocument ? null : <Scripts />}
      </body>
    </html>
  );
}
