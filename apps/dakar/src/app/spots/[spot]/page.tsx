import { getSeoPyramidsConfig } from '@/seopyramids.config';
import { fetchSpotBySlug, getSortedSpots } from '@/logic/fetch-spots';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Article } from '@/components/article/Article';
export const dynamic = 'force-static';
export const revalidate = false;

/**
 * route is /spots/[spot]
 */
type RouteParams = {
  spot: string;
};

// generateStaticParams for /spots/[spot]
export async function generateStaticParams(): Promise<RouteParams[]> {
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const allSpots = await getSortedSpots(blogConfig);
  return allSpots.map((spot) => ({ spot: spot.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const p = await params;
  const { spot } = p;
  console.log('metadata: route params', p);

  return {
    title: `Spot - ${spot}`,
    description: `Explore Dakar surf spots`,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { spot } = await params; // ['blockchain', 'tools', 'tooling-for-solidity-coders']

  console.log('route params', spot);
  //const url = '/spots/' + path.join('/');
  const slug = spot;

  if (slug.length === 0) {
    console.log('No path, 404');
    return notFound();
  }
  const blogConfig = getSeoPyramidsConfig().blogConfig;
  const posts = await getSortedSpots(blogConfig);

  const spotPost = await fetchSpotBySlug(blogConfig, slug);
  if (!spotPost) {
    return notFound();
  }

  console.log('spotPost', spotPost);

  return <Article post={spotPost} />;
}
