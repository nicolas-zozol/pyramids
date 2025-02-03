import './pm.css';
import { ProseMirrorEditorTelegram } from '@/components/prosemirror/telegram/ProseMirrorEditorTelegram';
import '../prosemirror-page.scss';
import { PageLinkNavigator } from '@robusta/pyramids-links';

export default function Telegram() {
  const pages = [
    { name: 'Suggest Box', href: '/prosemirror' },
    { name: 'Telegram', href: '/prosemirror/telegram' },
    { name: 'Minimal', href: '/prosemirror/minimal' },
  ];
  return (
    <main className={'blog-container'} id={'telegram'}>
      <h3>ProseMirror demonstration: telegram</h3>
      <section className={'mt-2'}>
        <PageLinkNavigator
          pages={pages}
          currentPathName={'/prosemirror/telegram'}
        />
      </section>
      <section className={'mt-6'}>
        <div className={'editor-telegram'}>
          Enter once <code>ENTER</code> to <span className={'stop'}>STOP</span>{' '}
          between sentence. Enter twice <code>ENTER</code> to{' '}
          <span className={'end'}> END</span>
          the telegram.
        </div>
      </section>
      <section className={'mt-6'}>
        <ProseMirrorEditorTelegram />
      </section>
    </main>
  );
}
