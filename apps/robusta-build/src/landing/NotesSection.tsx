import { NotesPreview } from '@robusta/pyramids-design-system';
import { buildUrl } from '@robusta/pyramids-routing';
import { urlScheme } from '../routing/scheme.js';
import { notesFeed } from './notes-feed.js';

/**
 * `NotesPreview` fed by this site's articles. Every string it renders is the
 * site's (BR-PYRAMID-8): the three headings below, and the posts `notesFeed`
 * builds from the index. None of the component's defaults reaches the page.
 *
 * Four posts because the surface is a two-column grid and four is what fills it.
 * The count is the call site's and not the component's.
 *
 * `allLinkHref` is the blog home rather than the design system's `#notes`
 * anchor: a URL of the set the section previews.
 *
 * A server component, statically generated: `NotesPreview` carries no
 * `'use client'` and the index is read in the build (BR-PYRAMID-7).
 *
 * What `robusta-landing-page` inherits: a working section, its feed and its
 * copy. It owes nothing back, and it is free to rewrite the three strings in the
 * voice it chooses — they are the site's copy, not a contract.
 */
export async function NotesSection({ locale }: { locale?: string }) {
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
      posts={await notesFeed(of, 4)}
    />
  );
}
