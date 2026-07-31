import { buildUrl } from '@robusta/pyramids-routing';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { categoryParams } from '@/routing/content-urls.js';
import { urlScheme } from '@/routing/scheme.js';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return categoryParams('default-locale');
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const locale = urlScheme.defaultLocale;
  const page = { kind: 'category', locale, category, page: 1 } as const;

  return (
    <RoutePlaceholder
      kind="category page"
      url={buildUrl(urlScheme, page)}
      facts={{ locale, category, page: '1' }}
    />
  );
}
