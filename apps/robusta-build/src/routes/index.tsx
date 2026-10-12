import { createFileRoute } from '@tanstack/react-router';
import { LandingPage } from '@/landing/index.js';
import { getNotesFeed } from '@/page-data/index.js';
import { urlScheme } from '@/routing/scheme.js';
import { getSeoPyramidsConfig } from '@/seopyramids.config.js';

const { title, description } = getSeoPyramidsConfig().pageCopy.landing.head;
const feed = { locale: urlScheme.defaultLocale, limit: 4 };

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [{ title }, { name: 'description', content: description }],
  }),
  loader: () => getNotesFeed({ data: feed }),
  component: Home,
});

function Home() {
  return <LandingPage posts={Route.useLoaderData()} />;
}
