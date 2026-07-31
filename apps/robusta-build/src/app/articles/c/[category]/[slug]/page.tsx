import { buildUrl } from '@robusta/pyramids-routing';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { categorisedArticleParams } from '@/routing/content-urls.js';
import { urlScheme } from '@/routing/scheme.js';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return categorisedArticleParams('default-locale');
}

export default async function CategorisedArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { category, slug } = await params;
  const locale = urlScheme.defaultLocale;
  const page = { kind: 'article', locale, category, slug } as const;

  return (
    <RoutePlaceholder
      kind="article carrying a category"
      url={buildUrl(urlScheme, page)}
      facts={{ locale, category, slug }}
    />
  );
}
