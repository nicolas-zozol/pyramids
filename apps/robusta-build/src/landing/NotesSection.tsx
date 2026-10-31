import { NotesPreview, type NotePost } from '@robusta/pyramids-design-system';
import { SiteLink } from '../components/SiteLink.js';
import { urlScheme } from '../routing/scheme.js';
import { buildUrl } from '../routing/url-scheme/index.js';
import { getCategoryLabel, getPageCopy } from '../seopyramids.config.js';

export interface NotesSectionProps {
  /** The page's Locale: its page copy, its Category labels and its blog home. */
  locale: string;
  posts: NotePost[];
}

/** `NotesPreview` on the posts it receives, every text from the page copy of its Locale; nothing on an empty feed. */
export function NotesSection({ locale, posts }: NotesSectionProps) {
  const { notes } = getPageCopy(locale).landing;
  if (posts.length === 0) return null;

  return (
    <NotesPreview
      eyebrow={notes.eyebrow}
      title={notes.title}
      allLinkLabel={notes.allLinkLabel}
      allLinkHref={buildUrl(urlScheme, { kind: 'blog-home', locale, page: 1 })}
      posts={posts.map((post) => labelled(post, locale))}
      linkComponent={SiteLink}
    />
  );
}

function labelled({ tag, ...post }: NotePost, locale: string): NotePost {
  return tag === undefined
    ? post
    : { ...post, tag: getCategoryLabel(locale, tag) };
}
