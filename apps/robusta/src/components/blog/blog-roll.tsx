import { Post, RollContext } from '@/logic/posts';
import { PostCard } from './PostCard';
import { PaginationLinks } from '@/components/blog/PaginationLinks';

type RollProps = {
  pageContext: RollContext;
};
export const BlogRoll = ({ pageContext }: RollProps) => {
  const { currentPage, roll, numberOfPages } = pageContext;

  return (
    <div className={'blog-container'}>
      <div className={'wrap justify-between'}>
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
    </div>
  );
};

export default BlogRoll;
