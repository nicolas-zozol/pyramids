import { createFileRoute } from '@tanstack/react-router';
import { ListingPage, listingHead } from '@/listing/index.ts';
import { getRollPage } from '@/page-data/index.ts';
import type { RollUrl } from '@/routing/url-scheme/index.ts';

export const Route = createFileRoute('/{-$locale}/articles/c/$category/')({
  head: ({ params }) => listingHead(rollAt(params)),
  loader: ({ params }) => getRollPage({ data: rollAt(params) }),
  component: CategoryPage,
});

/** The roll page the params name. */
function rollAt(params: { locale: string; category: string }): RollUrl {
  return {
    kind: 'category',
    locale: params.locale,
    category: params.category,
    page: 1,
  };
}

function CategoryPage() {
  return <ListingPage page={Route.useLoaderData()} />;
}
