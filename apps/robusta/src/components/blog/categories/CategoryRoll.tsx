import { Post, RollContext } from '@/logic/posts';
import { BlogPaginationLinks } from '@/components/blog/BlogPaginationLinks';
import { PostCard } from '@/components/blog/PostCard';
import { ParsedRoute } from '@/logic/routing/parse-url';

interface CategoryRollContext extends RollContext {
  categories: string[];
}
interface CategoryRollProps {
  pageContext: CategoryRollContext;
  route: ParsedRoute;
}

export const CategoryRoll = ({ pageContext, route }: CategoryRollProps) => {
  const { currentPage, roll, numberOfPages, categories } = pageContext;

  if (roll.length === 0) {
    return (
      <div className={'text-center'}>
        <h2 className={'text-neutral/80 mt-10 p-40 text-3xl'}>
          No posts found on this subject
        </h2>
      </div>
    );
  }

  return (
    <section className={'main-container'}>
      <div className={'grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'}>
        {roll.map((post: Post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      {numberOfPages > 1 && (
        <BlogPaginationLinks
          baseUrl={`/learn/${categories.join('/')}`}
          currentPage={currentPage}
          numberOfPages={numberOfPages}
        />
      )}
    </section>
  );
};
