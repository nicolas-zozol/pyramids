import { NotesPreview, type NotePost } from '@robusta/pyramids-design-system';
import { buildUrl } from '@robusta/pyramids-routing';
import { SiteLink } from '../components/SiteLink.js';
import { urlScheme } from '../routing/scheme.js';
import { getSeoPyramidsConfig } from '../seopyramids.config.js';

export interface NotesSectionProps {
  posts: NotePost[];
  /** The blog home "all articles" targets; the default locale when absent. */
  locale?: string;
}

/** `NotesPreview` on the posts it receives, every text from the page copy; nothing on an empty feed. */
export function NotesSection({ posts, locale }: NotesSectionProps) {
  if (posts.length === 0) return null;

  const { landing, categoryLabels } = getSeoPyramidsConfig().pageCopy;

  return (
    <NotesPreview
      eyebrow={landing.notes.eyebrow}
      title={landing.notes.title}
      allLinkLabel={landing.notes.allLinkLabel}
      allLinkHref={buildUrl(urlScheme, {
        kind: 'blog-home',
        locale: locale ?? urlScheme.defaultLocale,
        page: 1,
      })}
      posts={posts.map((post) => labelled(post, categoryLabels))}
      linkComponent={SiteLink}
    />
  );
}

function labelled(
  { tag, ...post }: NotePost,
  categoryLabels: Record<string, string>,
): NotePost {
  const label = tag === undefined ? undefined : categoryLabels[tag];
  return label === undefined ? post : { ...post, tag: label };
}
