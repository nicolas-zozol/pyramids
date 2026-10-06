import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  attribute,
  byClass,
  byTag,
  readableText,
  renderStatic,
  textNodes,
  type StaticNode,
} from '../test-support/render-static.js';
import { Hero } from './Hero.js';

const MASCOT = '/assets/crystal-tux.svg';

function mascotOf(tree: StaticNode[]) {
  const [mascot] = byClass(tree, 'sk-hero__mascot');
  assert.ok(mascot, 'the hero renders its mascot');
  return mascot;
}

describe('Hero rendered without its text props', () => {
  const tree = renderStatic(<Hero mascotSrc={MASCOT} />);

  it('captions the mascot with the prototype annotation, on two lines', () => {
    const [annotation] = byClass(tree, 'sk-hero__annotation');
    assert.deepEqual(textNodes([annotation]), [
      'this is crystal tux.',
      'she lives here.',
    ]);
    assert.equal(byTag([annotation], 'br').length, 1);
  });

  it('keeps the doodle arrow pointing from the annotation', () => {
    assert.equal(byClass(tree, 'sk-hero__doodle').length, 1);
  });

  it('gives the mascot the prototype alt text', () => {
    assert.equal(attribute(mascotOf(tree), 'alt'), 'crystal tux');
  });
});

describe('Hero annotation', () => {
  it('captions the figure with the annotation it is given', () => {
    const tree = renderStatic(
      <Hero mascotSrc={MASCOT} annotation="Une seule légende." />,
    );
    const [annotation] = byClass(tree, 'sk-hero__annotation');
    assert.deepEqual(textNodes([annotation]), ['Une seule légende.']);
  });

  it('captions the figure whether or not a mascot is rendered', () => {
    const tree = renderStatic(<Hero annotation="Une seule légende." />);
    assert.equal(byClass(tree, 'sk-hero__mascot').length, 0);
    assert.deepEqual(textNodes(byClass(tree, 'sk-hero__annotation')), [
      'Une seule légende.',
    ]);
  });

  for (const empty of ['', null]) {
    it(`leaves neither caption nor doodle in the tree when it is ${JSON.stringify(empty)}`, () => {
      const tree = renderStatic(<Hero mascotSrc={MASCOT} annotation={empty} />);
      assert.equal(byClass(tree, 'sk-hero__annotation').length, 0);
      assert.equal(byClass(tree, 'sk-hero__doodle').length, 0);
    });
  }
});

describe('Hero mascotAlt', () => {
  it('becomes the alt text of the mascot', () => {
    const tree = renderStatic(
      <Hero
        mascotSrc={MASCOT}
        mascotAlt="Crystal Tux, la mascotte de Robusta Build"
      />,
    );
    assert.equal(
      attribute(mascotOf(tree), 'alt'),
      'Crystal Tux, la mascotte de Robusta Build',
    );
  });

  it('writes an empty alt attribute when empty, the mascot being decorative', () => {
    const tree = renderStatic(<Hero mascotSrc={MASCOT} mascotAlt="" />);
    assert.equal(attribute(mascotOf(tree), 'alt'), '');
  });
});

describe('Hero rendered with every text prop', () => {
  it('lets no text of the prototype reach the reader, alt text included', () => {
    const prototype = new Set(
      readableText(renderStatic(<Hero mascotSrc={MASCOT} />)),
    );
    const tree = renderStatic(
      <Hero
        eyebrow="Sites web rapides et applications sur mesure"
        title="Des logiciels que vous maintiendrez encore dans cinq ans."
        subtitle="Une petite équipe, une longue mémoire."
        primaryCtaLabel="Prendre rendez-vous"
        primaryCtaHref="/contact"
        secondaryCtaLabel="Lire un audit"
        secondaryCtaHref="/audit"
        footnote="Disponible ce trimestre."
        mascotSrc={MASCOT}
        mascotAlt="Crystal Tux, la mascotte de Robusta Build"
        annotation=""
      />,
    );
    assert.deepEqual(
      readableText(tree).filter((text) => prototype.has(text)),
      [],
    );
  });
});
