import { createFileRoute } from '@tanstack/react-router';
import { LandingPage } from '@/landing/index.js';
import { getNotesFeed } from '@/page-data/index.js';
import { getPageCopy } from '@/seopyramids.config.js';

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
