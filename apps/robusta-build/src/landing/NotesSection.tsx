/**
 * Package landing — the home page's notes section, every string it renders supplied by the site.
 *
 * Design: features/pyramid-v2-epic/migrate-learn-content/migrate-learn-content.design.md
 * Requirements: R-MIGRATELEARN-44
 * Design: features/pyramid-v2-epic/tanstack-start-migration/tanstack-start-migration.design.md
 * Requirements: R-TANSTACK-65
 */
import { NotesPreview, type NotePost } from '@robusta/pyramids-design-system';
import { buildUrl } from '@robusta/pyramids-routing';
import { urlScheme } from '../routing/scheme.js';

interface NotesSectionProps {
  posts: NotePost[];
  /** The blog home "all articles" targets; the default locale when absent. */
  locale?: string;
}

/**
 * `NotesPreview` fed with the posts it receives, every string it renders being
 * the site's (BR-PYRAMID-8).
 */
export function NotesSection({ posts, locale }: NotesSectionProps) {
  const of = locale ?? urlScheme.defaultLocale;

  return (
    <NotesPreview
      eyebrow="// latest articles"
      title="what we publish."
      allLinkLabel="all articles"
      allLinkHref={buildUrl(urlScheme, {
        kind: 'blog-home',
        locale: of,
        page: 1,
      })}
      posts={posts}
    />
  );
}
