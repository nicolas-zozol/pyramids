import { Post } from '@/logic/posts';
import Link from 'next/link';
import { Tag } from '@/logic/tags';
import { SocialMedia } from './SocialMedia';
import { getThumbnail } from '@/logic/thumbnail';
import { EmptyLine } from '@robusta/pyramids-layouts';
interface ArticleProps {
  post: Post;
  valuableTags: Tag[];
}
import Script from 'next/script';
import './article.scss';
import './prism.scss';

export const Article = ({ post, valuableTags }: ArticleProps) => {
  return (
    <div>
      <article className={'blogpost blog-container'}>
        {/* ✅ Load External JS via `next/script` */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.9.0/prism.min.js"
          strategy="afterInteractive"
        />
        <section>
          <div>
            <h1>{post.title}</h1>
            <span className="text-info">{post.date}</span> by{' '}
            <span className="text-info">{post.author}</span>
          </div>
        </section>
        <EmptyLine size={2} />
        <img
          src={getThumbnail(post)}
          className={'max-w-[200px] object-contain'}
          alt={'thumbnail'}
        />
        <EmptyLine size={2} />

        <div dangerouslySetInnerHTML={{ __html: post.content }} />

        <SocialMedia post={post} className={'mt-10'} />

        <section className="list-tags mt-10">
          <strong>Learn more : </strong>
          {valuableTags.map((tag: string, index: number, array: string[]) => (
            <Link href={`/learn/${tag}`} key={tag} legacyBehavior={true}>
              <a>
                {tag} {index < array.length - 1 ? ', ' : ''}
              </a>
            </Link>
          ))}
        </section>
      </article>
    </div>
  );
};
