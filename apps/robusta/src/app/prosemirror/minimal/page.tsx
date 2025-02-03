import { ProseMirrorEditorMinimal } from '@/components/prosemirror/minimal/ProseMirrorEditorMinimal';
import './pm.css';
import '../prosemirror-page.scss';
import { PageLinkNavigator } from '@robusta/pyramids-links';

export default function Minimal() {
  const pages = [
    { name: 'Suggest Box', href: '/prosemirror' },
    { name: 'Telegram', href: '/prosemirror/telegram' },
    { name: 'Minimal', href: '/prosemirror/minimal' },
  ];
  return (
    <main className={'blog-container'} id={'telegram'}>
      <h3>ProseMirror demonstration: minimal editor</h3>
      <section className={'mt-2'}>
        <PageLinkNavigator
          pages={pages}
          currentPathName={'/prosemirror/minimal'}
        />
      </section>
      <section className={'mt-6'}>
        <div>This is the minimal editor: Free typing, no feature</div>
      </section>
      <section className={'mt-6'}>
        <ProseMirrorEditorMinimal />
      </section>
    </main>
  );
}
