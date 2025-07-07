import { Post } from '@/logic/posts';
import Link from 'next/link';
import { Tag } from '@/logic/tags';
import { SocialMedia } from '../SocialMedia';
import { getThumbnail } from '@/logic/thumbnail';
import { EmptyLine } from '@robusta/pyramids-layouts';
import Script from 'next/script';
import './article.scss';
import './prism.scss';
import { ParsedRoute } from '@/logic/routing/parse-url';
import { BreadCrumb } from '@/components/blog/breadcrumb/BreadCrumb';

interface ArticleProps {
  post: Post;
  valuableTags: Tag[];
  route: ParsedRoute;
}
export const Article = ({ post, valuableTags, route }: ArticleProps) => {
  return (
    <div>
      <div className={'blog-container'}>
        <BreadCrumb route={route} />
      </div>
      <article className={'blogpost blog-container'}>
        {/* ✅ Load External JS via `next/script` */}
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.9.0/prism.min.js"
          strategy="afterInteractive"
        />

        <section>
          <div>
            <h1>{post.title}</h1>
            <span className={'text-sm'}>
              {post.date} by {post.author}
            </span>
          </div>
        </section>
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
            <Link href={`/learn/tag/${tag}`} key={tag} legacyBehavior={true}>
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
