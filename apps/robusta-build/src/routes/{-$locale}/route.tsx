import { createFileRoute } from '@tanstack/react-router';
import { urlScheme } from '@/routing/scheme.ts';
import { localeOfSegment } from '@/routing/url-scheme/index.ts';

/**
 * The layout over the landing page and the content routes: it resolves the
 * optional Locale segment, the default Locale when absent, and discards the
 * match when the segment marks the default Locale or names no Locale of the site.
 */
export const Route = createFileRoute('/{-$locale}')({
  params: {
    parse: ({ locale }) => {
      const resolved = localeOfSegment(urlScheme, locale);
      return resolved === undefined ? false : { locale: resolved };
    },
    stringify: ({ locale }) => ({
      locale: locale === urlScheme.defaultLocale ? undefined : locale,
    }),
  },
});
