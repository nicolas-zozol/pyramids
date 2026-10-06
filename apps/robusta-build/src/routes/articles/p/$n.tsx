import { buildUrl } from '@robusta/pyramids-routing';
import { createFileRoute } from '@tanstack/react-router';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { urlScheme } from '@/routing/scheme.js';

export const Route = createFileRoute('/articles/p/$n')({
  component: BlogRollPage,
});

function BlogRollPage() {
  const { n } = Route.useParams();
  const locale = urlScheme.defaultLocale;
  const page = { kind: 'blog-home', locale, page: Number(n) } as const;

  return (
    <RoutePlaceholder
      kind="blog roll page"
      url={buildUrl(urlScheme, page)}
      facts={{ locale, page: n }}
    />
  );
}
