import type { Metadata } from 'next';
import { Caveat, IBM_Plex_Mono, IBM_Plex_Sans } from 'next/font/google';
import type { ReactNode } from 'react';

import { getSeoPyramidsConfig } from '../seopyramids.config.js';

// CSS load order is a contract, not a preference.
// The Tailwind entry first: Tailwind 4 emits its preflight inside `@layer base`.
// Then the design system's stylesheets, whose rules on `html`, `body`, `h1`,
// `h2`, `h3`, `p`, `code` and `pre` are unlayered and therefore what renders.
// `sketch.css` last, because its `.sk-*` primitives read the tokens
// `colors_and_type.css` defines.
import './globals.css';
import '@robusta/pyramids-design-system/colors_and_type.css';
import '@robusta/pyramids-design-system/sketch.css';

// The three brand faces, self-hosted at build time: the rendered page issues no
// request to a font CDN. Weights mirror the query string removed from the
// design system's stylesheet. Each loader exposes its face as a custom
// property, which is the contract `colors_and_type.css` publishes — the package
// keeps owning the family names, their order and their fallbacks.
const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-ibm-plex-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: '--font-ibm-plex-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

const caveat = Caveat({
  variable: '--font-caveat',
  subsets: ['latin'],
  weight: ['600', '700'],
  display: 'swap',
});

const config = getSeoPyramidsConfig();

export const metadata: Metadata = {
  title: config.siteTitle,
  description: config.mission,
  // The site carries no page copy yet. The directive sits at the root so it
  // covers every page the site will ever add, rather than the home page alone.
  // Removing it is an acceptance criterion of robusta-landing-page.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The three font variables go on `<html>`, the element `:root` addresses,
    // so the faces are in scope for the design system's token definitions.
    <html
      lang={config.defaultLocale}
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} ${caveat.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
