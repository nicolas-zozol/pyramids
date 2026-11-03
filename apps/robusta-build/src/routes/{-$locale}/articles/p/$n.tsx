import { buildUrl } from '@/routing/url-scheme/index.ts';
import { createFileRoute } from '@tanstack/react-router';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.tsx';
import { urlScheme } from '@/routing/scheme.ts';
import { getPageCopy } from '@/seopyramids.config.ts';

export const Route = createFileRoute('/{-$locale}/articles/p/$n')({
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
