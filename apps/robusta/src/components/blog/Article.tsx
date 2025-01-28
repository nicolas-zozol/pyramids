import { Post } from '@/logic/posts';
import img from '../../styles/components/img.module.scss';
import article from '../../styles/components/article.module.scss';
import Link from 'next/link';
import Head from 'next/head';
import { Tag } from '@/logic/tags';
import { SocialMedia } from './SocialMedia';
import { getThumbnail } from '@/logic/thumbnail';
import { MailingListForm } from '@/components/marketing/MailingList';

interface ArticleProps {
  post: Post;
  valuableTags: Tag[];
}

export const Article = ({ post, valuableTags }: ArticleProps) => {
  return (
    <div>
      {
        <Head>
          <link
            href="https://cdnjs.cloudflare.com/ajax/libs/prism-themes/1.9.0/prism-coy-without-shadows.min.css"
            rel="stylesheet"
          />
          <script
            src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.9.0/prism.min.js"
            async
          ></script>
        </Head>
      }

      <article className={article.blogpost}>
        <section>
          <img
            src={getThumbnail(post)}
            className={img.thumbnail}
            alt={'thumbnail'}
          />
          <div>
            <h2>{post.title}</h2>
            <span className="text-info">{post.date}</span> by{' '}
            <span className="text-info">{post.author}</span>
          </div>
        </section>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />

        <SocialMedia post={post} className={'mt-80'} />
        <MailingListForm />
        <section className="list-tags">
          <strong>Learn more :</strong>
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
