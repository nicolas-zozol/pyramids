import { buildUrl } from '@/routing/url-scheme/index.js';
import { createFileRoute } from '@tanstack/react-router';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { urlScheme } from '@/routing/scheme.js';
import { getCategoryLabel } from '@/seopyramids.config.js';

export const Route = createFileRoute('/$locale/articles/c/$category/')({
  component: CategoryPage,
});

function CategoryPage() {
  const { locale, category } = Route.useParams();
  const page = { kind: 'category', locale, category, page: 1 } as const;

  return (
    <RoutePlaceholder
      title={getCategoryLabel(locale, category)}
      url={buildUrl(urlScheme, page)}
    />
  );
}
