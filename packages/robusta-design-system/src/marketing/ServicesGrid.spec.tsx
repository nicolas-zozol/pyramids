import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  attribute,
  byClass,
  byTag,
  hostElements,
  readableText,
  renderStatic,
  textNodes,
  type HostElement,
} from '../test-support/render-static.js';
import { ServicesGrid, type ServiceItem } from './ServicesGrid.js';

const AUDIT: ServiceItem = {
  title: "L'audit",
  time: '2 à 3 semaines',
  body: 'Nous lisons votre code et vos incidents.',
  moreLabel: 'voir le déroulé',
  moreHref: '/services/audit',
};

const EMBEDDED: ServiceItem = {
  title: 'Ingénierie embarquée',
  time: '1 à 2 trimestres',
  body: "Nous rejoignons votre équipe le temps qu'il faut.",
  moreLabel: 'bientôt détaillé',
};

const SURGERY: ServiceItem = {
  title: 'Chirurgie ciblée',
  time: '3 à 6 mois',
  body: 'Nous remplaçons la pièce qui bloque le reste.',
};

function cardsOf(services?: ServiceItem[]): HostElement[] {
  return byClass(
    renderStatic(<ServicesGrid services={services} />),
    'sk-services-grid__card',
  );
}

function moreLineOf(card: HostElement): HostElement[] {
  return byClass([card], 'sk-services-grid__more');
}

function carriesNoDestination(card: HostElement): boolean {
  return (
    byTag([card], 'a').length === 0 &&
    hostElements([card]).every((el) => !('href' in el.props))
  );
}

describe('ServicesGrid link line of a card', () => {
  const [audit, embedded, surgery] = cardsOf([AUDIT, EMBEDDED, SURGERY]);

  it('is an anchor to moreHref when the card carries a label and a destination', () => {
    const [line] = moreLineOf(audit);
    assert.equal(line?.tag, 'a');
    assert.equal(attribute(line, 'href'), '/services/audit');
    assert.deepEqual(textNodes([line]), ['voir le déroulé']);
  });

  it('is text carrying no anchor and no # when the card carries a label alone', () => {
    const [line] = moreLineOf(embedded);
    assert.ok(line, 'the line is rendered');
    assert.deepEqual(textNodes([line]), ['bientôt détaillé']);
    assert.ok(carriesNoDestination(embedded));
  });

  it('is absent when the card carries no label', () => {
    assert.deepEqual(moreLineOf(surgery), []);
  });

  it('is absent when the label is empty, even with a destination', () => {
    const [card] = cardsOf([
      { ...SURGERY, moreLabel: '', moreHref: '/services/chirurgie' },
    ]);
    assert.deepEqual(moreLineOf(card), []);
  });

  it('is absent when the card carries a destination and no label', () => {
    const [card] = cardsOf([{ ...SURGERY, moreHref: '/services/chirurgie' }]);
    assert.deepEqual(moreLineOf(card), []);
  });
});

describe('ServicesGrid default services', () => {
  const cards = cardsOf();

  it('are the three cards of the prototype', () => {
    assert.equal(cards.length, 3);
  });

  it('each carry the prototype line "see how it works" as text, with no destination', () => {
    for (const card of cards) {
      assert.deepEqual(textNodes(moreLineOf(card)), ['see how it works']);
      assert.ok(carriesNoDestination(card));
    }
  });
});

describe('ServicesGrid rendered with every text prop', () => {
  it('lets no text of the prototype reach the reader', () => {
    const prototype = new Set(readableText(renderStatic(<ServicesGrid />)));
    const tree = renderStatic(
      <ServicesGrid
        eyebrow="Ce que nous faisons"
        title="Trois façons de travailler."
        services={[
          { ...AUDIT, tag: 'le plus demandé', tagTone: 'pink' },
          {
            ...EMBEDDED,
            moreLabel: undefined,
            tag: 'enjeux forts',
            tagTone: 'blue',
          },
          { ...SURGERY, tag: 'ciblé', tagTone: 'green' },
        ]}
      />,
    );
    assert.deepEqual(
      readableText(tree).filter((text) => prototype.has(text)),
      [],
    );
  });
});
