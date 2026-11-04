import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { readableText, renderStatic } from './render-static.ts';

describe('readableText', () => {
  it('reads the text nodes, then the alt, placeholder, aria-label and title of every element', () => {
    const tree = renderStatic(
      <div title="un titre">
        un texte
        <img alt="une image" src="x.svg" />
        <input placeholder="votre e-mail" />
        <span aria-label="une étiquette" />
      </div>,
    );
    assert.deepEqual(readableText(tree), [
      'un texte',
      'un titre',
      'une image',
      'votre e-mail',
      'une étiquette',
    ]);
  });

  it('drops the empty ones, a decorative image included', () => {
    const tree = renderStatic(
      <div title="">
        <img alt="" src="x.svg" />
        <input placeholder="" />
        <span aria-label="" />
      </div>,
    );
    assert.deepEqual(readableText(tree), []);
  });
});
