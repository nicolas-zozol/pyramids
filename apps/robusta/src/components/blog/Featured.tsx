import { Post } from '@/logic/posts';
import { PostCard } from './PostCard';

type FeaturedPostProps = {
  posts: Post[];
};

export const FeaturedPosts = ({ posts }: FeaturedPostProps) => {
  return (
    <>
      <h2>recent articles</h2>

      <div className={'wrap justify-between'}>
        {posts.map((post: Post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  );
};
