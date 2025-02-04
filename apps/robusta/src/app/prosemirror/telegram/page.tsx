import './pm.css';
import { ProseMirrorEditorTelegram } from '@/components/prosemirror/telegram/ProseMirrorEditorTelegram';
import '../prosemirror-page.scss';
import { PageLinkNavigator } from '@robusta/pyramids-links';

export default function Telegram() {
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
          currentPathName={'/prosemirror/telegram'}
          className={'bg-secondary flex justify-around rounded-2xl p-4'}
        />
      </section>
      <section className={'my-6'}>
        <h1 className={'font-alt'}>Prosemirror telegram Plugin</h1>
        <p className={'my-4'}>This plugin simulate an old telegram sent text</p>
      </section>
      <section className={'my-6'}>
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
