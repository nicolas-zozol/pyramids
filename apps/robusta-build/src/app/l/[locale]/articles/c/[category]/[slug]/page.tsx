import { ArticleView } from '@/article/ArticleView.js';
import { categorisedArticleParams } from '@/routing/content-urls.js';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return categorisedArticleParams('other-locales');
}

export default async function LocalisedCategorisedArticlePage({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  return <ArticleView locale={locale} slug={slug} />;
}
