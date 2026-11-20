import { createFileRoute } from '@tanstack/react-router';
import { RbCompoundPage, rbCompoundHead } from '@/rb-compound/index.ts';

export const Route = createFileRoute('/{-$locale}/rb-compound')({
  head: ({ params }) => rbCompoundHead(params.locale),
  component: RbCompound,
});

function RbCompound() {
  const { locale } = Route.useParams();
  return <RbCompoundPage locale={locale} />;
}
