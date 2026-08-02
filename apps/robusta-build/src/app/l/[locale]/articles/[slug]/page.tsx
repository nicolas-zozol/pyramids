import { ArticleView } from '@/article/ArticleView.js';
import { looseArticleParams } from '@/routing/content-urls.js';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return looseArticleParams('other-locales');
}

export default async function LocalisedArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  return <ArticleView locale={locale} slug={slug} />;
}
