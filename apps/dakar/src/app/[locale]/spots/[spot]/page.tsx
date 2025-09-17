import { getSeoPyramidsConfig } from '@/seopyramids.config';
import { fetchSpotBySlug, getSortedSpots } from '@/logic/fetch-spots';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Article } from '@/components/article/Article';

export const dynamic = 'force-static';
export const revalidate = false;

type RouteParams = {
  locale: string;
  spot: string;
};

export async function generateStaticParams(): Promise<RouteParams[]> {
  const { blogConfig } = getSeoPyramidsConfig();
  const locales = [blogConfig.defaultLocale, ...blogConfig.otherLocales];

  const params: RouteParams[] = [];
  for (const locale of locales) {
    const spots = await getSortedSpots(blogConfig, locale);
    params.push(...spots.map((s) => ({ locale, spot: s.slug })));
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { spot, locale } = await params;
  return {
    title: `Spot - ${spot} (${locale})`,
    description: `Explore ${locale.toUpperCase()} surf spots`,
  };
}

export default async function SpotPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { locale, spot } = await params;

  if (!spot || spot.length === 0) {
    return notFound();
  }
  const { blogConfig } = getSeoPyramidsConfig();
  const spotPost = await fetchSpotBySlug(blogConfig, locale, spot);
  if (!spotPost) {
    return notFound();
  }

  return <Article post={spotPost} />;
}


