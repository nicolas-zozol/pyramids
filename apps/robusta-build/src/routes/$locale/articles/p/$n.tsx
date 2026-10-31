import { buildUrl } from '@/routing/url-scheme/index.js';
import { createFileRoute } from '@tanstack/react-router';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { urlScheme } from '@/routing/scheme.js';
import { getPageCopy } from '@/seopyramids.config.js';

export const Route = createFileRoute('/$locale/articles/p/$n')({
  component: BlogRollPage,
});

function BlogRollPage() {
  const { locale, n } = Route.useParams();
  const page = { kind: 'blog-home', locale, page: Number(n) } as const;

  return (
    <RoutePlaceholder
      title={getPageCopy(locale).listing.blogTitle}
      url={buildUrl(urlScheme, page)}
    />
  );
}
