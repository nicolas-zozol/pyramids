import type { NotePost } from '@robusta/pyramids-design-system';
import { describe, expect, it } from 'vitest';
import { getSeoPyramidsConfig } from '../seopyramids.config.js';
import { anchorsTo, htmlText } from '../test-support/markup.js';
import { renderInRouter } from '../test-support/render-in-router.js';
import { NotesSection } from './NotesSection.js';

const { notes } = getSeoPyramidsConfig().pageCopy.landing;
const { categoryLabels } = getSeoPyramidsConfig().pageCopy;

const posts: NotePost[] = [
  {
    title: 'Quel second langage apprendre ?',
    href: '/articles/c/theory/quel-second-langage',
    tag: 'theory',
    date: '13 déc.',
  },
  {
    title: 'Une note sans libellé',
    href: '/articles/c/inconnue/une-note',
    tag: 'inconnue',
    date: '2 févr.',
  },
];

describe('NotesSection', () => {
  it('renders nothing on an empty feed, no empty section and no sample note', () => {
    expect(NotesSection({ posts: [] })).toBeNull();
  });

  it('renders the posts it receives, three of them as three notes', async () => {
    const three = [posts[0], posts[0], posts[1]];
    const html = await renderInRouter(<NotesSection posts={three} />);

    expect(html.match(/class="sk-notes-preview__post"/g)).toHaveLength(3);
  });

  it('reads its eyebrow, title and "all articles" label in the page copy', async () => {
    const html = await renderInRouter(<NotesSection posts={posts} />);

    expect(html).toContain(`>${htmlText(notes.eyebrow)}<`);
    expect(html).toContain(`>${htmlText(notes.title)}<`);
    expect(html).toContain(`>${htmlText(notes.allLinkLabel)}<`);
    expect(anchorsTo(html, '/articles')).toHaveLength(1);
  });

  it('points "all articles" at the blog home of the locale it is given', async () => {
    const html = await renderInRouter(
      <NotesSection posts={posts} locale="en" />,
    );

    expect(anchorsTo(html, '/l/en/articles')).toHaveLength(1);
  });

  it('tags a note with its Category’s French label, never the slug, and drops an unlabelled tag', async () => {
    const html = await renderInRouter(<NotesSection posts={posts} />);

    expect(categoryLabels.theory).toBeTruthy();
    expect(html).toContain(`>${htmlText(categoryLabels.theory)}<`);
    expect(html).not.toMatch(/>theory</);
    expect(html).not.toMatch(/>inconnue</);
    expect(html.match(/class="sk-tag/g)).toHaveLength(1);
  });

  it('renders its notes as router links carrying their href', async () => {
    const html = await renderInRouter(
      <NotesSection posts={posts} />,
      '/articles/c/theory/quel-second-langage',
    );

    const [current] = anchorsTo(html, '/articles/c/theory/quel-second-langage');
    expect(current).toContain('aria-current="page"');
  });
});
