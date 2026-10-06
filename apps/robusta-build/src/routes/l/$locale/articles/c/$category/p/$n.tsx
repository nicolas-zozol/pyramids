import { buildUrl } from '@robusta/pyramids-routing';
import { createFileRoute } from '@tanstack/react-router';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { urlScheme } from '@/routing/scheme.js';

export const Route = createFileRoute('/l/$locale/articles/c/$category/p/$n')({
  component: LocalisedCategoryRollPage,
});

function LocalisedCategoryRollPage() {
  const { locale, category, n } = Route.useParams();
  const page = { kind: 'category', locale, category, page: Number(n) } as const;

  return (
    <RoutePlaceholder
      kind="category roll page"
      url={buildUrl(urlScheme, page)}
      facts={{ locale, category, page: n }}
    />
  );
}
