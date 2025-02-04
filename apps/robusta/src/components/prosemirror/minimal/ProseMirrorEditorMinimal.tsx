'use client';

import { FC, useEffect, useRef, useState } from 'react';
import { createProseEditorMinimal } from './create-prose-editor-minimal';
import { SimpleLink } from '@robusta/pyramids-links';

export const ProseMirrorEditorMinimal: FC = () => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const editorItem = document.querySelector('#editor-minimal')!;
    const { view } = createProseEditorMinimal(editorItem);
    editorRef.current?.addEventListener('input', handleInput);

    setTimeout(() => {
      view.focus();
    }, 200);

    return () => {
      view.destroy();
    };
  }, []);

  const handleInput = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText.trim();
    const words = text.split(' ').filter((word) => word !== '');
    setWordCount(words.length);
    setCharCount(text.length);
  };

  return (
    <>
      <section className={'my-6'}>
        <h3 className={'font-bold'}>React section:</h3>
        <ul>
          <li>Words : {wordCount || '0'} words </li>
          <li>Characters: {charCount || '0'} chars</li>
        </ul>
      </section>

      <section className={'my-6'}>
        <h3 className={'font-bold'}>ProseMirror section:</h3>
        <div
          id="editor-minimal"
          ref={editorRef}
          className={'ProseMirror editor'}
        ></div>
      </section>

      <section>
        <p>There are two ways to handle the problem</p>
        <ul>
          <li>
            Intercept the <code>Dispatch</code> method on any change on
            ProseMirror. Optimal, but you lust be sure to not miss a command.
          </li>
          <li>
            Use the low-level <code>'input'</code> event :{' '}
            <code>
              {' '}
              editorRef.current?.addEventListener('input', handleInput);
            </code>{' '}
          </li>
          <li>
            Use a mix: <code>'input'</code> events 🥶{' '}
            <SimpleLink href={'https://stackoverflow.com/a/62912636'}>
              don't intercept easily undo/redo
            </SimpleLink>
          </li>
        </ul>
      </section>
    </>
  );
};
