import { createFileRoute } from '@tanstack/react-router';
import { LandingPage, landingHead } from '@/landing/index.ts';
import { getNotesFeed } from '@/page-data/index.ts';
import { NOTES_FEED_SIZE } from '@/routing/scheme.ts';

export const Route = createFileRoute('/{-$locale}/')({
  head: ({ params }) => landingHead(params.locale),
  loader: ({ params }) =>
    getNotesFeed({ data: { locale: params.locale, limit: NOTES_FEED_SIZE } }),
  component: Landing,
});

function Landing() {
  const { locale } = Route.useParams();
  return <LandingPage locale={locale} posts={Route.useLoaderData()} />;
}
