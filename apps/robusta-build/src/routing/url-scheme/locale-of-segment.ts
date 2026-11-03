import type { UrlScheme } from './scheme.ts';

/**
 * The Locale an optional first route segment designates: the default locale
 * when absent, another locale when it names one exactly; undefined when it
 * marks the default locale or names no locale of the scheme. Strict on case,
 * unlike `parseUrl`: it decides what the route table serves, canonical forms only.
 */
export function localeOfSegment(
  scheme: UrlScheme,
  segment: string | undefined,
): string | undefined {
  if (segment === undefined) {
    return scheme.defaultLocale;
  }
  return scheme.otherLocales.includes(segment) ? segment : undefined;
}
