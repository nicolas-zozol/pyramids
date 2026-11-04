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
} from '../test-support/render-static.ts';
import { Hero } from './Hero.tsx';

const MASCOT = '/assets/crystal-tux.svg';

function mascotOf(tree: StaticNode[]) {
  const [mascot] = byClass(tree, 'sk-hero__mascot');
  assert.ok(mascot, 'the hero renders its mascot');
  return mascot;
}

describe('Hero rendered without its text props', () => {
  const tree = renderStatic(<Hero mascotSrc={MASCOT} />);

  it('renders neither the eyebrow nor its arrow', () => {
    assert.equal(byClass(tree, 'sk-hero__eyebrow').length, 0);
    assert.equal(byClass(tree, 'sk-hero__eyebrow-arrow').length, 0);
  });

  it('renders no h1 and no subtitle', () => {
    assert.equal(byTag(tree, 'h1').length, 0);
    assert.equal(byClass(tree, 'sk-hero__subtitle').length, 0);
  });

  it('renders no call to action, no footnote, no caption and no doodle, the actions row staying', () => {
    assert.equal(byClass(tree, 'sk-hero__actions').length, 1);
    assert.equal(byClass(tree, 'sk-btn').length, 0);
    assert.equal(byClass(tree, 'sk-hero__footnote').length, 0);
    assert.equal(byClass(tree, 'sk-hero__annotation').length, 0);
    assert.equal(byClass(tree, 'sk-hero__doodle').length, 0);
  });

  it('writes an empty alt on the mascot, decorative', () => {
    assert.equal(attribute(mascotOf(tree), 'alt'), '');
  });

  it('lets no text reach the reader', () => {
    assert.deepEqual(readableText(tree), []);
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
  it('lets the texts it is given alone reach the reader, alt text included', () => {
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
        annotation="Une seule légende."
      />,
    );
    assert.deepEqual(readableText(tree), [
      'Sites web rapides et applications sur mesure',
      'Des logiciels que vous maintiendrez encore dans cinq ans.',
      'Une petite équipe, une longue mémoire.',
      'Prendre rendez-vous',
      'Lire un audit',
      'Disponible ce trimestre.',
      'Une seule légende.',
      'Crystal Tux, la mascotte de Robusta Build',
    ]);
  });

  it('renders the eyebrow with its arrow', () => {
    const tree = renderStatic(<Hero eyebrow="Sites web rapides" />);
    const [eyebrow] = byClass(tree, 'sk-hero__eyebrow');
    assert.equal(byClass([eyebrow], 'sk-hero__eyebrow-arrow').length, 1);
  });
});
