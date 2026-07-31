import { buildUrl } from '@robusta/pyramids-routing';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { rollPageParams } from '@/routing/content-urls.js';
import { urlScheme } from '@/routing/scheme.js';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return rollPageParams('other-locales');
}

export default async function LocalisedBlogRollPage({
  params,
}: {
  params: Promise<{ locale: string; n: string }>;
}) {
  const { locale, n } = await params;
  const page = { kind: 'blog-home', locale, page: Number(n) } as const;

  return (
    <RoutePlaceholder
      kind="blog roll page"
      url={buildUrl(urlScheme, page)}
      facts={{ locale, page: n }}
    />
  );
}
