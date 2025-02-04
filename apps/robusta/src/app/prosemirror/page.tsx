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

export const revalidate = 300;

export default function Home() {
  const pages = [
    { name: 'Suggest Box example', href: '/prosemirror' },
    { name: 'Telegram plugin', href: '/prosemirror/telegram' },
    { name: 'Minimal with React', href: '/prosemirror/minimal' },
  ];

  return (
    <main className={'blog-container'} id={'prose-mirror-page'}>
      <section className={'my-6'}>
        <PageLinkNavigator
          pages={pages}
          currentPathName={'/prosemirror'}
          className={'bg-secondary flex justify-around rounded-2xl p-4'}
        />
      </section>
      <section className={'my-6'}>
        <h1 className={'font-alt'}>ProseMirror Editor examples</h1>
        <p className={'my-4'}>
          ProseMirror is an open-source toolkit for building customizable,
          feature-rich text editors.
        </p>
        <p className={'my-4'}>
          A good example of ProseMirror design, is that they are not built on
          listening events, but on <b>commands dispatching</b>. If you consider
          the DOM as the source, then it's a <b>CQRS</b> implementation, similar
          to redux or blockchains approaches.
        </p>
      </section>

      <section className={'my-6'}>
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
      <section className={'my-6'}>
        <ProseMirrorEditorAutocomplete />
      </section>
    </main>
  );
}
