import './article.scss';
import { EmptyLine } from '@robusta/pyramids-layouts';
import { Post } from '@/logic/fetch-spots';
import { ReactNode } from 'react';

interface ArticleProps {
  post: Post;
  feat?: ReactNode;
}
export const Article = ({ post, feat }: ArticleProps) => {
  return (
    <div>
      <div className={'blog-container'}></div>
      <article className={'blogpost blog-container'}>
        <section>
          <div>
            <h1>{post.title}</h1>
            <span className={'text-sm'}>
              {post.date} by {post.author}
            </span>
          </div>
        </section>

        {/*<img
          src={getThumbnail(post)}
          className={'max-w-[200px] object-contain'}
          alt={'thumbnail'}
        />*/}
        <EmptyLine size={2} />

        {feat && <div className="mb-6">{feat}</div>}

        <div dangerouslySetInnerHTML={{ __html: post.content }} />

        {/*
        <SocialMedia post={post} className={'mt-10'} />

        <section className="list-tags mt-10">
          <strong>Learn more : </strong>
          {valuableTags.map((tag: string, index: number, array: string[]) => (
            <Link href={`/learn/tag/${tag}`} key={tag} legacyBehavior={true}>
              <a>
                {tag} {index < array.length - 1 ? ', ' : ''}
              </a>
            </Link>
          ))}
        </section>
        */}
      </article>
    </div>
  );
};
