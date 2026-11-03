import type { NotePost } from '@robusta/pyramids-design-system';
import { describe, expect, it } from 'vitest';
import { getCategoryLabel, getPageCopy } from '../seopyramids.config.ts';
import { anchorsTo, htmlText } from '../test-support/markup.ts';
import { renderInRouter } from '../test-support/render-in-router.tsx';
import { NotesSection } from './NotesSection.tsx';

const theory: NotePost = {
  title: 'Quel second langage apprendre ?',
  href: '/fr/articles/c/theory/quel-second-langage',
  tag: 'theory',
  date: '13 déc.',
};

const untagged: NotePost = {
  title: 'Une note sans Category',
  href: '/fr/articles/une-note',
  date: '2 févr.',
};

const posts = [theory, untagged];

describe('NotesSection', () => {
  it('renders nothing on an empty feed, no empty section and no sample note', () => {
    expect(NotesSection({ locale: 'es', posts: [] })).toBeNull();
  });

  it('renders the posts it receives, three of them as three notes', async () => {
    const html = await renderInRouter(
      <NotesSection locale="fr" posts={[theory, theory, untagged]} />,
    );

    expect(html.match(/class="sk-notes-preview__post"/g)).toHaveLength(3);
  });

  it('reads its eyebrow, title and "all articles" label in the page copy of its Locale', async () => {
    for (const locale of ['en', 'fr']) {
      const { notes } = getPageCopy(locale).landing;
      const html = await renderInRouter(
        <NotesSection locale={locale} posts={[untagged]} />,
      );

      expect(html).toContain(`>${htmlText(notes.eyebrow)}<`);
      expect(html).toContain(`>${htmlText(notes.title)}<`);
      expect(html).toContain(`>${htmlText(notes.allLinkLabel)}<`);
    }
  });

  it('points "all articles" at the blog home of its Locale', async () => {
    const french = await renderInRouter(
      <NotesSection locale="fr" posts={posts} />,
    );
    const english = await renderInRouter(
      <NotesSection locale="en" posts={[untagged]} />,
    );

    expect(anchorsTo(french, '/fr/articles')).toHaveLength(1);
    expect(anchorsTo(english, '/articles')).toHaveLength(1);
  });

  it('tags a note with the label of its Category in its Locale, never the slug', async () => {
    const html = await renderInRouter(
      <NotesSection locale="fr" posts={posts} />,
    );

    expect(html).toContain(`>${htmlText(getCategoryLabel('fr', 'theory'))}<`);
    expect(html).not.toMatch(/>theory</);
    expect(html.match(/class="sk-tag/g)).toHaveLength(1);
  });

  it('throws naming the Category and the Locale when that Locale has no label for a note’s Category', () => {
    expect(() => NotesSection({ locale: 'en', posts: [theory] })).toThrow(
      /"theory"[\s\S]*"en"/,
    );
  });

  it('throws naming a Locale the site does not declare', () => {
    expect(() => NotesSection({ locale: 'de', posts: [untagged] })).toThrow(
      /"de"/,
    );
  });

  it('renders its notes as router links carrying their href', async () => {
    const html = await renderInRouter(
      <NotesSection locale="fr" posts={posts} />,
      '/fr/articles/c/theory/quel-second-langage',
    );

    const [current] = anchorsTo(
      html,
      '/fr/articles/c/theory/quel-second-langage',
    );
    expect(current).toContain('aria-current="page"');
  });
});
