import { buildUrl } from '@robusta/pyramids-routing';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { urlScheme } from '@/routing/scheme.js';

export const dynamic = 'force-static';
export const dynamicParams = false;

export default function BlogHomePage() {
  const locale = urlScheme.defaultLocale;
  const page = { kind: 'blog-home', locale, page: 1 } as const;

  return (
    <RoutePlaceholder
      kind="blog home"
      url={buildUrl(urlScheme, page)}
      facts={{ locale, page: '1' }}
    />
  );
}
