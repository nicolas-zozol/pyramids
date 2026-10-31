import { createFileRoute } from '@tanstack/react-router';
import { LandingPage } from '@/landing/index.ts';
import { getNotesFeed } from '@/page-data/index.ts';
import { getPageCopy } from '@/seopyramids.config.ts';

const NOTES_LIMIT = 4;

export const Route = createFileRoute('/$locale/')({
  head: ({ params }) => {
    const { title, description } = getPageCopy(params.locale).landing.head;
    return { meta: [{ title }, { name: 'description', content: description }] };
  },
  loader: ({ params }) =>
    getNotesFeed({ data: { locale: params.locale, limit: NOTES_LIMIT } }),
  component: Landing,
});

function Landing() {
  const { locale } = Route.useParams();
  return <LandingPage locale={locale} posts={Route.useLoaderData()} />;
}
