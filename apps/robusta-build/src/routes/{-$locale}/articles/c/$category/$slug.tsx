import { createFileRoute } from '@tanstack/react-router';
import { ArticleView, articleHead } from '@/article/index.ts';
import { getArticlePage } from '@/page-data/index.ts';

export const Route = createFileRoute('/{-$locale}/articles/c/$category/$slug')({
  loader: ({ params }) =>
    getArticlePage({ data: { locale: params.locale, slug: params.slug } }),
  head: ({ loaderData }) => articleHead(loaderData),
  component: CategorisedArticlePage,
});

function CategorisedArticlePage() {
  return <ArticleView page={Route.useLoaderData()} />;
}
