import { createFileRoute } from '@tanstack/react-router';
import { ArticleView } from '@/article/ArticleView.js';
import { getArticlePage } from '@/page-data/index.js';
import { urlScheme } from '@/routing/scheme.js';

export const Route = createFileRoute('/articles/c/$category/$slug')({
  loader: ({ params }) =>
    getArticlePage({
      data: { locale: urlScheme.defaultLocale, slug: params.slug },
    }),
  component: CategorisedArticlePage,
});

function CategorisedArticlePage() {
  return <ArticleView page={Route.useLoaderData()} />;
}
