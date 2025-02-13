import { getThumbnail } from '@/logic/thumbnail';
import { Post } from '@/logic/posts';
import Image from 'next/image';
import { SimpleCardComponent } from '@robusta/pyramids-layouts';
import Link from 'next/link';

type PostCardProps = {
  post: Post;
};

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <Link href={`/learn/${post.category}/s/${post.slug}`}>
      <SimpleCardComponent
        className={'bg-base-100 relative mb-8 flex w-80 flex-col'}
        effects={['reveal', 'fadeUp', 'shadowPop']}
      >
        <div className={'font-alt little-bar text-2xl'}>{post.title}</div>
        <div className={'mb-[30px] h-full flex-grow'}>
          <Image
            src={getThumbnail(post)}
            className={'float-right p-2'}
            alt={post.title}
            width={200}
            height={0} // Height is set to 0 because it's auto-calculated
          />
          <p className={'no-justify'}>{post.excerpt}</p>
        </div>
        <div className={'absolute bottom-[20px] w-full'}>
          <div className={'mr-8 flex justify-end'}>
            <span className={'btn btn-secondary'}>Read More</span>
          </div>
        </div>
      </SimpleCardComponent>
    </Link>
  );
};
