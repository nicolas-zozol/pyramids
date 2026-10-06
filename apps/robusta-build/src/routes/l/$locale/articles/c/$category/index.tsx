import { buildUrl } from '@robusta/pyramids-routing';
import { createFileRoute } from '@tanstack/react-router';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { urlScheme } from '@/routing/scheme.js';

export const Route = createFileRoute('/l/$locale/articles/c/$category/')({
  component: LocalisedCategoryPage,
});

function LocalisedCategoryPage() {
  const { locale, category } = Route.useParams();
  const page = { kind: 'category', locale, category, page: 1 } as const;

  return (
    <RoutePlaceholder
      kind="category page"
      url={buildUrl(urlScheme, page)}
      facts={{ locale, category, page: '1' }}
    />
  );
}
