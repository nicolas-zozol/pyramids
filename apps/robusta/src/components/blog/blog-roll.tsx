import { Post, RollContext } from '@/logic/posts';
import { PostCard } from './PostCard';
import { PaginationLinks } from '@/components/blog/PaginationLinks';

type RollProps = {
  pageContext: RollContext;
};
export const BlogRoll = ({ pageContext }: RollProps) => {
  const { currentPage, roll, numberOfPages } = pageContext;

  return (
    <article className={'blog-container'}>
      <div className={'flex flex-wrap justify-between'}>
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

export default BlogRoll;
