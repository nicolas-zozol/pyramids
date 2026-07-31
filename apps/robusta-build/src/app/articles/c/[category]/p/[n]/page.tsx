import { buildUrl } from '@robusta/pyramids-routing';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { categoryRollPageParams } from '@/routing/content-urls.js';
import { urlScheme } from '@/routing/scheme.js';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return categoryRollPageParams('default-locale');
}

export default async function CategoryRollPage({
  params,
}: {
  params: Promise<{ category: string; n: string }>;
}) {
  const { category, n } = await params;
  const locale = urlScheme.defaultLocale;
  const page = { kind: 'category', locale, category, page: Number(n) } as const;

  return (
    <RoutePlaceholder
      kind="category roll page"
      url={buildUrl(urlScheme, page)}
      facts={{ locale, category, page: n }}
    />
  );
}
