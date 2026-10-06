import { createFileRoute } from '@tanstack/react-router';
import { ArticleView } from '@/article/ArticleView.js';
import { getArticlePage } from '@/page-data/index.js';

export const Route = createFileRoute('/l/$locale/articles/c/$category/$slug')({
  loader: ({ params }) =>
    getArticlePage({ data: { locale: params.locale, slug: params.slug } }),
  component: LocalisedCategorisedArticlePage,
});

function LocalisedCategorisedArticlePage() {
  return <ArticleView page={Route.useLoaderData()} />;
}
