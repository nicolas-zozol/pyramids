/**
 * Package routing — the site's URL scheme instance and its Locales, and the derivations the build and the pages read from them.
 *
 * Design: features/pyramid-v2-epic/multilingual-site/multilingual-site.design.md
 * Requirements: R-MULTILINGUAL-04, R-MULTILINGUAL-24, R-MULTILINGUAL-26, R-MULTILINGUAL-61
 */
import type { UrlScheme } from './url-scheme/index.js';

/**
 * The roll size is a constant of 12, not a per-site knob — decision of
 * 2026-07-31. `UrlScheme.rollSize` stays a parameter so the derivation is
 * testable at any value; what is fixed is the value this site supplies.
 */
export const ROLL_SIZE = 12;

/** The site's three Locales, the default one first. */
export const LOCALES = ['en', 'fr', 'es'] as const;

export type Locale = (typeof LOCALES)[number];

const [defaultLocale, ...otherLocales] = LOCALES;

/**
 * The site's one scheme instance, so no route composes a `UrlScheme` of its own.
 *
 * It is a leaf module on purpose. `seopyramids.config.ts` reads these four
 * values into `blogConfig`, and the Locales into its root, rather than the
 * other way round, because the site
 * configuration resolves the design system's wordmark through a bundler-only
 * PNG import, and the plain-Node build scripts have to reach the scheme
 * without it. `articles` is still written
 * once, in site-owned code, and the shared base never holds it.
 */
export const urlScheme: UrlScheme = {
  contentRoot: 'articles',
  defaultLocale,
  otherLocales,
  rollSize: ROLL_SIZE,
};
