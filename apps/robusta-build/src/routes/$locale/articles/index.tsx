import { buildUrl } from '@/routing/url-scheme/index.js';
import { createFileRoute } from '@tanstack/react-router';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { urlScheme } from '@/routing/scheme.js';
import { getPageCopy } from '@/seopyramids.config.js';

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
