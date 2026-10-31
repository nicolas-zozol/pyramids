import { buildUrl } from '@/routing/url-scheme/index.ts';
import { createFileRoute } from '@tanstack/react-router';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.tsx';
import { urlScheme } from '@/routing/scheme.ts';
import { getPageCopy } from '@/seopyramids.config.ts';

export const Route = createFileRoute('/$locale/articles/')({
  component: BlogHomePage,
});

function BlogHomePage() {
  const { locale } = Route.useParams();
  const page = { kind: 'blog-home', locale, page: 1 } as const;

  return (
    <RoutePlaceholder
      title={getPageCopy(locale).listing.blogTitle}
      url={buildUrl(urlScheme, page)}
    />
  );
}
