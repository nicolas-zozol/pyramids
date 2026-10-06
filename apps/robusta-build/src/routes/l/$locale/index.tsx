import { buildUrl } from '@robusta/pyramids-routing';
import { createFileRoute } from '@tanstack/react-router';
import { RoutePlaceholder } from '@/components/RoutePlaceholder.js';
import { urlScheme } from '@/routing/scheme.js';

export const Route = createFileRoute('/l/$locale/')({
  component: LocalisedLandingPage,
});

function LocalisedLandingPage() {
  const { locale } = Route.useParams();
  const page = { kind: 'landing', locale } as const;

  return (
    <RoutePlaceholder
      kind="landing page"
      url={buildUrl(urlScheme, page)}
      facts={{ locale }}
    />
  );
}
