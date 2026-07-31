import { buildUrl } from '@robusta/pyramids-routing';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { landingParams } from '@/routing/content-urls.js';
import { urlScheme } from '@/routing/scheme.js';

export const dynamic = 'force-static';
export const dynamicParams = false;

/**
 * Empty today, and part of the shape all the same: the locale-prefixed landing
 * gets its param set the day robusta-landing-page supplies landing copy in
 * another locale, and no route work is needed then.
 */
export function generateStaticParams() {
  return landingParams();
}

export default async function LocalisedLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = { kind: 'landing', locale } as const;

  return (
    <RoutePlaceholder
      kind="landing page"
      url={buildUrl(urlScheme, page)}
      facts={{ locale }}
    />
  );
}
