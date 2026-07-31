import type { UrlScheme } from '@robusta/pyramids-routing';

/**
 * The roll size is a constant of 12, not a per-site knob — decision of
 * 2026-07-31. `UrlScheme.rollSize` stays a parameter so the derivation is
 * testable at any value; what is fixed is the value this site supplies.
 */
export const ROLL_SIZE = 12;

/**
 * The site's one scheme instance, so no route composes a `UrlScheme` of its own.
 *
 * It is a leaf module on purpose. `seopyramids.config.ts` reads these four
 * values into `blogConfig` rather than the other way round, because the site
 * configuration resolves the design system's wordmark through a bundler-only
 * PNG import, and `next.config.ts` — which is loaded outside the webpack
 * pipeline — has to reach the scheme without it. `articles` is still written
 * once, in site-owned code, and the shared base never holds it.
 */
export const urlScheme: UrlScheme = {
  contentRoot: 'articles',
  defaultLocale: 'en',
  otherLocales: ['fr'],
  rollSize: ROLL_SIZE,
};
