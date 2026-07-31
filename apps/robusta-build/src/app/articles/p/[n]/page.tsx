import { buildUrl } from '@robusta/pyramids-routing';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { rollPageParams } from '@/routing/content-urls.js';
import { urlScheme } from '@/routing/scheme.js';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return rollPageParams('default-locale');
}

export default async function BlogRollPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const { n } = await params;
  const locale = urlScheme.defaultLocale;
  const page = { kind: 'blog-home', locale, page: Number(n) } as const;

  return (
    <RoutePlaceholder
      kind="blog roll page"
      url={buildUrl(urlScheme, page)}
      facts={{ locale, page: n }}
    />
  );
}
