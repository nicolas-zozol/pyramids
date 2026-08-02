import { ArticleView } from '@/article/ArticleView.js';
import { categorisedArticleParams } from '@/routing/content-urls.js';
import { urlScheme } from '@/routing/scheme.js';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return categorisedArticleParams('default-locale');
}

/**
 * The category param addresses the page and identifies nothing the slug does
 * not: `validateArticles` refuses two articles sharing a slug within a locale,
 * so the lookup reads the locale and the slug alone.
 */
export default async function CategorisedArticlePage({
  params,
}: {
  params: Promise<{ category: string; slug: string }>;
}) {
  const { slug } = await params;

  return <ArticleView locale={urlScheme.defaultLocale} slug={slug} />;
}
