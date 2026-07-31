import { buildUrl } from '@robusta/pyramids-routing';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { categoryRollPageParams } from '@/routing/content-urls.js';
import { urlScheme } from '@/routing/scheme.js';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return categoryRollPageParams('other-locales');
}

export default async function LocalisedCategoryRollPage({
  params,
}: {
  params: Promise<{ locale: string; category: string; n: string }>;
}) {
  const { locale, category, n } = await params;
  const page = { kind: 'category', locale, category, page: Number(n) } as const;

  return (
    <RoutePlaceholder
      kind="category roll page"
      url={buildUrl(urlScheme, page)}
      facts={{ locale, category, page: n }}
    />
  );
}
