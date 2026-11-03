import { buildUrl } from '@/routing/url-scheme/index.ts';
import { createFileRoute } from '@tanstack/react-router';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.tsx';
import { urlScheme } from '@/routing/scheme.ts';
import { getCategoryLabel } from '@/seopyramids.config.ts';

export const Route = createFileRoute('/{-$locale}/articles/c/$category/p/$n')({
  component: CategoryRollPage,
});

function CategoryRollPage() {
  const { locale, category, n } = Route.useParams();
  const page = { kind: 'category', locale, category, page: Number(n) } as const;

  return (
    <RoutePlaceholder
      title={getCategoryLabel(locale, category)}
      url={buildUrl(urlScheme, page)}
    />
  );
}
