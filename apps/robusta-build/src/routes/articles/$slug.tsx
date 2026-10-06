import { createFileRoute } from '@tanstack/react-router';
import { ArticleView } from '@/article/ArticleView.js';
import { getArticlePage } from '@/page-data/index.js';
import { urlScheme } from '@/routing/scheme.js';

export const Route = createFileRoute('/articles/$slug')({
  loader: ({ params }) =>
    getArticlePage({
      data: { locale: urlScheme.defaultLocale, slug: params.slug },
    }),
  component: ArticlePage,
});

function ArticlePage() {
  return <ArticleView page={Route.useLoaderData()} />;
}
