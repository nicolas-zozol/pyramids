import { getSeoPyramidsConfig } from '@/seopyramids.config';
import { redirect } from 'next/navigation';
export const dynamic = 'force-static';
export const revalidate = false;

type RouteParams = {
  spot: string;
};

export default async function LegacySpotPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { spot } = await params;
  const { blogConfig } = getSeoPyramidsConfig();
  const defaultLocale = blogConfig.defaultLocale || 'en';
  return redirect(`/${defaultLocale}/spots/${spot}`);
}
