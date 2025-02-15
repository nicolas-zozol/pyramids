import { Post, RollContext } from '@/logic/posts';
import { BlogPaginationLinks } from '@/components/blog/BlogPaginationLinks';
import { PostCard } from '@/components/blog/PostCard';
import { ParsedRoute } from '@/logic/routing/parse-url';
import { BreadCrumb } from '@/components/blog/breadcrumb/BreadCrumb';
import { EmptyLine } from '@robusta/pyramids-layouts';

export interface TagRollContext extends RollContext {
  tag: string;
}
interface TagRollProps {
  rollContext: TagRollContext;
  route: ParsedRoute;
}

export const TagRoll = ({ rollContext, route }: TagRollProps) => {
  const { currentPage, roll, numberOfPages, tag } = rollContext;

  if (roll.length === 0) {
    return (
      <div className={'text-center'}>
        <h2 className={'text-neutral/80 mt-10 p-40 text-3xl'}>
          No posts found on this subject
        </h2>
      </div>
    );
  }

  return (
    <section className={'main-container'}>
      <BreadCrumb route={route} />
      <EmptyLine />

      <div className={'grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'}>
        {roll.map((post: Post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
      {numberOfPages > 1 && (
        <BlogPaginationLinks
          baseUrl={`/learn/tag/${tag}`}
          currentPage={currentPage}
          numberOfPages={numberOfPages}
        />
      )}
    </section>
  );
};
