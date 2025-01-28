import { getThumbnail } from '@/logic/thumbnail';
import { Post } from '@/logic/posts';
import { SimpleLink } from '@robusta/pyramids-links';

type PostCardProps = {
  post: Post;
};

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <div className={'card mb-8 w-80'} key={post.slug}>
      <SimpleLink href={`/blog/${post.category}/${post.slug}`}>
        {post.title}
      </SimpleLink>
      <div>
        <img
          src={getThumbnail(post)}
          className={'float-right'}
          alt={post.title}
        />
        <p className={'no-justify'}>{post.excerpt}</p>
      </div>
      <div className={'stick-bottom'}>
        <SimpleLink href={`/blog/${post.category}/${post.slug}`}>
          Read More
        </SimpleLink>
      </div>
    </div>
  );
};
