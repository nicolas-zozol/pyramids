import { NotesPreview, type NotePost } from '@robusta/pyramids-design-system';
import { Breadcrumb } from '../components/Breadcrumb.tsx';
import { SiteLink } from '../components/SiteLink.tsx';
import type { RollPage } from '../page-data/index.ts';
import type { RollUrl } from '../routing/url-scheme/index.ts';
import { getCategoryLabel, getPageCopy } from '../seopyramids.config.ts';
import { rollTrail } from './roll-trail.ts';

export interface ListingPageProps {
  page: RollPage;
  /** The roll page rendered. */
  url: RollUrl;
}

/** The breadcrumb of a Category roll, the h1, the roll by NotesPreview, then the nav between the pages of the roll when it has another page. */
export function ListingPage({ page, url }: ListingPageProps) {
  const { locale, category, posts, previousUrl, nextUrl } = page;
  const copy = getPageCopy(locale);
  const { blogTitle, pagination } = copy.listing;
  const title =
    category === undefined ? blogTitle : getCategoryLabel(locale, category);
  const trail = rollTrail(page, url);

  return (
    <main>
      {trail.length > 0 && (
        <div
          style={{ paddingTop: 'var(--sp-5)', paddingInline: 'var(--sp-6)' }}
        >
          <Breadcrumb label={copy.breadcrumb.navLabel} trail={trail} />
        </div>
      )}
      <h1
        style={{
          margin: 0,
          paddingTop: 'var(--sp-7)',
          paddingInline: 'var(--sp-6)',
        }}
      >
        {title}
      </h1>
      {posts.length > 0 && (
        <NotesPreview
          posts={posts.map((post) => labelled(post, locale))}
          linkComponent={SiteLink}
        />
      )}
      {(previousUrl !== undefined || nextUrl !== undefined) && (
        <nav
          aria-label={pagination.navLabel}
          style={{
            display: 'flex',
            gap: 'var(--sp-5)',
            padding: 'var(--sp-5) var(--sp-6)',
          }}
        >
          {previousUrl !== undefined && (
            <SiteLink href={previousUrl}>{pagination.newerLabel}</SiteLink>
          )}
          {nextUrl !== undefined && (
            <SiteLink href={nextUrl}>{pagination.olderLabel}</SiteLink>
          )}
        </nav>
      )}
    </main>
  );
}

function labelled({ tag, ...post }: NotePost, locale: string): NotePost {
  return tag === undefined
    ? post
    : { ...post, tag: getCategoryLabel(locale, tag) };
}
