import { Post } from '@/logic/posts';
import { PostCard } from './PostCard';
import { H2Title } from '../title/H2Title';

type FeaturedPostProps = {
  posts: Post[];
};

export const FeaturedPosts = ({ posts }: FeaturedPostProps) => {
  return (
    <>
      <H2Title>Recent articles</H2Title>

      <div className={'flex flex-wrap justify-between'}>
        {posts.map((post: Post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  );
};
