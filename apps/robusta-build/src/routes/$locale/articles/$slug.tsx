import { createFileRoute } from '@tanstack/react-router';
import { ArticleView } from '@/article/ArticleView.js';
import { getArticlePage } from '@/page-data/index.js';

export const Route = createFileRoute('/$locale/articles/$slug')({
  loader: ({ params }) =>
    getArticlePage({ data: { locale: params.locale, slug: params.slug } }),
  component: ArticlePage,
});

function ArticlePage() {
  return <ArticleView page={Route.useLoaderData()} />;
}
