import { Post, RollContext } from '@/logic/posts';
import { PostCard } from './PostCard';
import { PaginationLinks } from '@/components/blog/PaginationLinks';

type RollProps = {
  pageContext: RollContext;
};
export const BlogRoll = ({ pageContext }: RollProps) => {
  const { currentPage, roll, numberOfPages } = pageContext;

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
    <article className={'main-container'}>
      <div className={'grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'}>
        {roll.map((post: Post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      {numberOfPages > 1 && (
        <PaginationLinks
          currentPage={currentPage}
          numberOfPages={numberOfPages}
        />
      )}
    </article>
  );
};
