import { buildUrl } from '@robusta/pyramids-routing';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { categorisedArticleParams } from '@/routing/content-urls.js';
import { urlScheme } from '@/routing/scheme.js';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return categorisedArticleParams('other-locales');
}

export default async function LocalisedCategorisedArticlePage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale, category, slug } = await params;
  const page = { kind: 'article', locale, category, slug } as const;

  return (
    <RoutePlaceholder
      kind="article carrying a category"
      url={buildUrl(urlScheme, page)}
      facts={{ locale, category, slug }}
    />
  );
}
