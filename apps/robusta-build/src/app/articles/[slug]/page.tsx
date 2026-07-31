import { buildUrl } from '@robusta/pyramids-routing';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { looseArticleParams } from '@/routing/content-urls.js';
import { urlScheme } from '@/routing/scheme.js';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return looseArticleParams('default-locale');
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = urlScheme.defaultLocale;
  const page = { kind: 'article', locale, slug } as const;

  return (
    <RoutePlaceholder
      kind="article carrying no category"
      url={buildUrl(urlScheme, page)}
      facts={{ locale, slug }}
    />
  );
}
