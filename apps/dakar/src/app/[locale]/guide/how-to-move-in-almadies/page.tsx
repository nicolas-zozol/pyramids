import { notFound } from 'next/navigation';
import { Article } from '@/components/article/Article';
import { fetchPageByFilename } from '@/logic/fetch-page';

export const dynamic = 'force-static';
export const revalidate = false;
const filePath = 'guide/how-to-move-in-almadies';

export default async function HowToMovePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const post = await fetchPageByFilename(locale, filePath);
  if (!post) return notFound();
  return <Article post={post} />;
}
