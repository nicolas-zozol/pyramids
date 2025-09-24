import { getSeoPyramidsConfig } from '@/seopyramids.config';
import { fetchSpotPostBySlug, getSortedSpots } from '@/logic/fetch-spots';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Article } from '@/components/article/Article';
import { MapLibre } from '@/components/map/MapLibre';
import { ReactElement } from 'react';
import { Spot } from '@/logic/spots/spot.js';

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

function buildMapFeature(spot: Spot): ReactElement {
  // Default to Ngor village if no coordinates are provided in post
  const latitude = spot.latitude;
  const longitude = spot.longitude;
  return <MapLibre latitude={latitude} longitude={longitude} height={240} />;
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
  const spotPost = await fetchSpotPostBySlug(blogConfig, locale, spot);
  if (!spotPost) {
    return notFound();
  }

  // If posts carry coordinates, use them; otherwise fall back to defaults
  const feat = buildMapFeature(spotPost.spot);
  return <Article post={spotPost} feat={feat} />;
}
