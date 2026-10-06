import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  attribute,
  renderStatic,
  textNodes,
  type HostElement,
} from '../test-support/render-static.js';
import { SkButton } from './SkButton.js';

function only(tree: ReturnType<typeof renderStatic>): HostElement {
  const [element] = tree;
  assert.ok(
    tree.length === 1 && typeof element !== 'string',
    'one element is rendered',
  );
  return element;
}

describe('SkButton without an href', () => {
  const button = only(
    renderStatic(
      <SkButton variant="primary" type="submit" className="extra">
        envoyer
      </SkButton>,
    ),
  );

  it('renders the button it has always rendered', () => {
    assert.equal(button.tag, 'button');
    assert.equal(attribute(button, 'href'), undefined);
    assert.deepEqual(textNodes([button]), ['envoyer']);
  });

  it('forwards the attributes of a button', () => {
    assert.equal(attribute(button, 'type'), 'submit');
  });
});

describe('SkButton with an href', () => {
  const anchor = only(
    renderStatic(
      <SkButton
        variant="primary"
        href="/contact"
        target="_blank"
        className="extra"
      >
        prendre rendez-vous
      </SkButton>,
    ),
  );

  it('renders one anchor carrying the destination', () => {
    assert.equal(anchor.tag, 'a');
    assert.equal(attribute(anchor, 'href'), '/contact');
    assert.deepEqual(textNodes([anchor]), ['prendre rendez-vous']);
  });

  it('forwards the attributes of an anchor', () => {
    assert.equal(attribute(anchor, 'target'), '_blank');
  });

  it('carries the class list the button branch computes', () => {
    const button = only(
      renderStatic(
        <SkButton variant="primary" className="extra">
          x
        </SkButton>,
      ),
    );
    assert.equal(
      attribute(anchor, 'className'),
      'sk-btn sk-btn--primary extra',
    );
    assert.equal(
      attribute(button, 'className'),
      attribute(anchor, 'className'),
    );
  });
});
