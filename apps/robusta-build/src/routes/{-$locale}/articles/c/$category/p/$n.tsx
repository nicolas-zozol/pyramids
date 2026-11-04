import { createFileRoute } from '@tanstack/react-router';
import { ListingPage, listingHead } from '@/listing/index.ts';
import { getRollPage } from '@/page-data/index.ts';
import type { RollUrl } from '@/routing/url-scheme/index.ts';

export const Route = createFileRoute('/{-$locale}/articles/c/$category/p/$n')({
  head: ({ params, loaderData }) => listingHead(rollAt(params), loaderData),
  loader: ({ params }) => getRollPage({ data: rollAt(params) }),
  component: CategoryRollPage,
});

/** The roll page the params name. */
function rollAt(params: {
  locale: string;
  category: string;
  n: string;
}): RollUrl {
  return {
    kind: 'category',
    locale: params.locale,
    category: params.category,
    page: Number(params.n),
  };
}

function CategoryRollPage() {
  return (
    <ListingPage page={Route.useLoaderData()} url={rollAt(Route.useParams())} />
  );
}
