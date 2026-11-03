import { buildUrl } from '@/routing/url-scheme/index.ts';
import { createFileRoute } from '@tanstack/react-router';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.tsx';
import { urlScheme } from '@/routing/scheme.ts';
import { getCategoryLabel } from '@/seopyramids.config.ts';

export const Route = createFileRoute('/{-$locale}/articles/c/$category/')({
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
