import { ArticleView } from '@/article/ArticleView.js';
import { looseArticleParams } from '@/routing/content-urls.js';
import { urlScheme } from '@/routing/scheme.js';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return looseArticleParams('default-locale');
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <ArticleView locale={urlScheme.defaultLocale} slug={slug} />;
}
