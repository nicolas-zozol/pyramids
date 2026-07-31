import { buildUrl } from '@robusta/pyramids-routing';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { blogHomeParams } from '@/routing/content-urls.js';
import { urlScheme } from '@/routing/scheme.js';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return blogHomeParams();
}

export default async function LocalisedBlogHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const page = { kind: 'blog-home', locale, page: 1 } as const;

  return (
    <RoutePlaceholder
      kind="blog home"
      url={buildUrl(urlScheme, page)}
      facts={{ locale, page: '1' }}
    />
  );
}
