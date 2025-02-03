import type { Metadata } from 'next';
import { setRouterPath } from '@robusta/pyramids-helpers';
import { AppRouterPage, PAGES } from '@/app/router';
import { ProseMirrorEditorAutocomplete } from '@/components/prosemirror/autocomplete/ProseMirrorEditorAutocomplete';
import './pm.css';
import './prosemirror-page.scss';
import { PageLinkNavigator } from '@robusta/pyramids-links';

setRouterPath<AppRouterPage>(PAGES.PROSE_MIRROR);

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Prose Mirror expert`,
    description:
      'Prose Mirror is a powerful tool for building rich text editors',
  };
}

export const revalidate = 3000;

export default function Home() {
  const pages = [
    { name: 'Suggest Box', href: '/prosemirror' },
    { name: 'Telegram', href: '/prosemirror/telegram' },
    { name: 'Minimal', href: '/prosemirror/minimal' },
  ];

  return (
    <main className={'blog-container'} id={'prose-mirror-page'}>
      <h3>ProseMirror demonstration: IdeaFlow & Suggest Box</h3>
      <section className={'mt-2'}>
        <PageLinkNavigator pages={pages} currentPathName={'/prosemirror'} />
      </section>
      <section className={'mt-6'}>
        <p>
          Type <code>@</code> to select a{' '}
          <span className={'mention'}>@User</span> : unmatched user will close
          the box
        </p>
        <p>
          Type <code>#</code> to select or create a{' '}
          <span className={'hashtag'}>#Hashtag</span> : <code>SPACE</code> will
          select the hashtag
        </p>
        <p>
          Type <code>&lt;&gt;</code> to select or create an{' '}
          <span className={'flow'}>&lt;&gt;IdeaFlow</span> : free flow text
        </p>
        <p>
          Then, type <code>ENTER</code> or <code>TAB</code> to select your
          choice, <code>ESCAPE</code> to cancel it.
        </p>
      </section>
      <section className={'mt-6'}>
        <ProseMirrorEditorAutocomplete />
      </section>
    </main>
  );
}
