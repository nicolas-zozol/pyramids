import { ProseMirrorEditorMinimal } from '@/components/prosemirror/minimal/ProseMirrorEditorMinimal';
import './pm.css';
import '../prosemirror-page.scss';
import { PageLinkNavigator } from '@robusta/pyramids-links';

export default function Minimal() {
  const pages = [
    { name: 'Suggest Box example', href: '/prosemirror' },
    { name: 'Telegram plugin', href: '/prosemirror/telegram' },
    { name: 'Minimal with React', href: '/prosemirror/minimal' },
  ];
  return (
    <main className={'blog-container'} id={'telegram'}>
      <section className={'my-6'}>
        <PageLinkNavigator
          pages={pages}
          currentPathName={'/prosemirror/minimal'}
          className={'bg-secondary flex justify-around rounded-2xl p-4'}
        />
      </section>
      <section className={'my-6'}>
        <h1 className={'font-alt'}>ProseMirror with React interaction</h1>
        <p className={'my-4'}>
          This is the minimal editor: Free typing, no feature. Through a{' '}
          <code>useRef</code> code, all text update is logged in the console
          powered by React.
        </p>
      </section>

      <section className={'my-6'}>
        <ProseMirrorEditorMinimal />
      </section>
    </main>
  );
}
