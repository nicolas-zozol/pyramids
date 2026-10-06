import type { NotePost } from '@robusta/pyramids-design-system';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { NotesSection } from './NotesSection.js';

const posts: NotePost[] = [
  {
    title: 'Leaving Gmail',
    href: '/articles/c/privacy/leaving-gmail',
    tag: 'privacy',
    date: 'mar 12',
  },
  {
    title: 'Ledger versus Metamask',
    href: '/articles/c/blockchain/ledger-versus-metamask',
    tag: 'blockchain',
    date: 'feb 02',
  },
];

describe('NotesSection', () => {
  it('renders the posts it receives, synchronously', () => {
    const html = renderToStaticMarkup(<NotesSection posts={posts} />);

    expect(html).toContain('Leaving Gmail');
    expect(html).toContain('href="/articles/c/privacy/leaving-gmail"');
    expect(html).toContain('Ledger versus Metamask');
  });

  it('points "all articles" at the blog home of the default locale when none is given', () => {
    const html = renderToStaticMarkup(<NotesSection posts={posts} />);

    expect(html).toMatch(/<a href="\/articles"[^>]*>[^<]*all articles/);
  });

  it('points "all articles" at the blog home of the locale it is given', () => {
    const html = renderToStaticMarkup(
      <NotesSection posts={posts} locale="fr" />,
    );

    expect(html).toMatch(/<a href="\/l\/fr\/articles"[^>]*>[^<]*all articles/);
  });
});
