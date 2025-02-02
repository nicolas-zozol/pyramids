import { getThumbnail } from '@/logic/thumbnail';
import { Post } from '@/logic/posts';
import { SimpleLink } from '@robusta/pyramids-links';
import Image from 'next/image';
import { TitleLink } from '@robusta/pyramids-links/dist/SimpleLink';
import { CtaLink } from '@robusta/pyramids-ctas';
import { SimpleCardComponent } from '@robusta/pyramids-layouts';

type PostCardProps = {
  post: Post;
};

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <SimpleCardComponent
      className={'bg-base-200 relative mb-8 flex w-80 flex-col'}
    >
      <TitleLink
        href={`/blog/${post.category}/${post.slug}`}
        className={'text-2xl'}
      >
        {post.title}
      </TitleLink>
      <div className={'mb-[20px] h-full flex-grow'}>
        <Image
          src={getThumbnail(post)}
          className={'float-right p-2'}
          alt={post.title}
          width={200}
          height={0} // Height is set to 0 because it's auto-calculated
        />
        <p className={'no-justify'}>{post.excerpt}</p>
      </div>
      <div className={'absolute bottom-[20px]'}>
        <CtaLink
          href={`/blog/${post.category}/${post.slug}`}
          className={
            'border-[#581287] text-[0.9rem] uppercase hover:text-[#d4941f]'
          }
        >
          Read More
        </CtaLink>
      </div>
    </SimpleCardComponent>
  );
};
