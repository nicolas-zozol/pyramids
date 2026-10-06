import { buildUrl } from '@robusta/pyramids-routing';
import { createFileRoute } from '@tanstack/react-router';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { urlScheme } from '@/routing/scheme.js';

export const Route = createFileRoute('/articles/c/$category/p/$n')({
  component: CategoryRollPage,
});

function CategoryRollPage() {
  const { category, n } = Route.useParams();
  const locale = urlScheme.defaultLocale;
  const page = { kind: 'category', locale, category, page: Number(n) } as const;

  return (
    <RoutePlaceholder
      kind="category roll page"
      url={buildUrl(urlScheme, page)}
      facts={{ locale, category, page: n }}
    />
  );
}
