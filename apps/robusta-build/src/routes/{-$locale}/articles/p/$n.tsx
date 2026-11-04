import { createFileRoute } from '@tanstack/react-router';
import { ListingPage, listingHead } from '@/listing/index.ts';
import { getRollPage } from '@/page-data/index.ts';
import type { RollUrl } from '@/routing/url-scheme/index.ts';

export const Route = createFileRoute('/{-$locale}/articles/p/$n')({
  head: ({ params, loaderData }) => listingHead(rollAt(params), loaderData),
  loader: ({ params }) => getRollPage({ data: rollAt(params) }),
  component: BlogRollPage,
});

/** The roll page the params name. */
function rollAt(params: { locale: string; n: string }): RollUrl {
  return {
    kind: 'blog-home',
    locale: params.locale,
    page: Number(params.n),
  };
}

function BlogRollPage() {
  return (
    <ListingPage page={Route.useLoaderData()} url={rollAt(Route.useParams())} />
  );
}
