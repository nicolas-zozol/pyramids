/**
 * Package routing — the site's URL scheme instance and its Locales, and the derivations the build and the pages read from them.
 *
 * Design: features/pyramid-v2-epic/multilingual-site/multilingual-site.design.md
 * Requirements: R-MULTILINGUAL-04, R-MULTILINGUAL-24, R-MULTILINGUAL-26, R-MULTILINGUAL-61, R-MULTILINGUAL-101
 * Design: features/pyramid-v2-epic/__done/seo-url-scheme/seo-url-scheme.design.md
 * Requirements: R-URLSCHEME-2, R-URLSCHEME-7, R-URLSCHEME-11, R-URLSCHEME-12, R-URLSCHEME-14, R-URLSCHEME-15, R-URLSCHEME-22, R-URLSCHEME-25, R-URLSCHEME-26, R-URLSCHEME-27, R-URLSCHEME-28
 * Design: features/pyramid-v2-epic/migrate-learn-content/migrate-learn-content.design.md
 * Requirements: R-MIGRATELEARN-61
 * Design: features/pyramid-v2-epic/default-locale-fr/default-locale-fr.design.md
 * Requirements: R-DEFAULTLOCALE-21, R-DEFAULTLOCALE-22
 * Design: features/pyramid-v2-epic/default-locale-at-root/default-locale-at-root.design.md
 * Requirements: R-ROOTLOCALE-04, R-ROOTLOCALE-42, R-ROOTLOCALE-81
 */
import type { UrlScheme } from './url-scheme/index.ts';

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
