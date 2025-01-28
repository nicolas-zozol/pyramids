import { Post } from '@/logic/posts';
import img from '../../styles/components/img.module.scss';
import blogRoll from '../../styles/posts/BlogRoll.module.scss';

import { getThumbnail } from '@/logic/thumbnail';
import { Tag } from '@/logic/tags';
import { SimpleLink } from '@robusta/pyramids-links';

interface TagRollProps {
  tag: Tag;
  posts: Post[];
}
export const TagRoll = ({ posts }: TagRollProps) => {
  return (
    <div className={'blog-container wrap'}>
      <div className={'wrap justify-around'}>
        {posts.map((post: Post) => (
          <div className={'card w-500 mb-80'} key={post.slug}>
            <SimpleLink href={`/blog/${post.category}/${post.slug}`}>
              {post.title}
            </SimpleLink>
            <div className={blogRoll.excerpt}>
              <p>{post.excerpt}</p>
              <img
                src={getThumbnail(post)}
                className={img.thumbnail}
                alt={post.title}
              />
            </div>
            <SimpleLink href={`/blog/${post.category}/${post.slug}`}>
              Read More
            </SimpleLink>
          </div>
        ))}
      </div>
    </div>
  );
};
