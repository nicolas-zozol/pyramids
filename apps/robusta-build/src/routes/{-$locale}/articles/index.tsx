import { createFileRoute } from '@tanstack/react-router';
import { ListingPage, listingHead } from '@/listing/index.ts';
import { getRollPage } from '@/page-data/index.ts';
import type { RollUrl } from '@/routing/url-scheme/index.ts';

export const Route = createFileRoute('/{-$locale}/articles/')({
  head: ({ params }) => listingHead(rollAt(params)),
  loader: ({ params }) => getRollPage({ data: rollAt(params) }),
  component: BlogHomePage,
});

/** The roll page the params name. */
function rollAt(params: { locale: string }): RollUrl {
  return { kind: 'blog-home', locale: params.locale, page: 1 };
}

function BlogHomePage() {
  return <ListingPage page={Route.useLoaderData()} />;
}
