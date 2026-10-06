import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  readableText,
  renderStatic,
  textNodes,
  type HostElement,
} from '../test-support/render-static.js';
import { BrandLogo } from './BrandLogo.js';

const PROTOTYPE_TAGLINE = 'senior engineering, hand-built.';
const BRAND_MARK = ['💪', '🏗', 'Robusta Build'];

function rootOf(tree: ReturnType<typeof renderStatic>): HostElement {
  const [root] = tree;
  assert.ok(
    root && typeof root !== 'string',
    'the logo renders one root element',
  );
  return root;
}

describe('BrandLogo full variant', () => {
  it('renders the prototype tagline under the lockup by default', () => {
    const root = rootOf(renderStatic(<BrandLogo size="full" />));
    assert.equal(root.children.length, 2);
    assert.deepEqual(textNodes([root.children[1]]), [PROTOTYPE_TAGLINE]);
  });

  it('renders the tagline it is given', () => {
    const root = rootOf(
      renderStatic(
        <BrandLogo size="full" tagline="Ingénierie senior, faite main." />,
      ),
    );
    assert.deepEqual(textNodes([root.children[1]]), [
      'Ingénierie senior, faite main.',
    ]);
  });

  it('renders no tagline line when the tagline is empty', () => {
    const root = rootOf(renderStatic(<BrandLogo size="full" tagline="" />));
    assert.equal(root.children.length, 1);
    assert.ok(!textNodes([root]).includes(PROTOTYPE_TAGLINE));
  });

  it('lets no text of the prototype reach the reader when its tagline is supplied, the brand mark aside', () => {
    const prototype = new Set(
      readableText(renderStatic(<BrandLogo size="full" />)),
    );
    const tree = renderStatic(
      <BrandLogo size="full" tagline="Ingénierie senior, faite main." />,
    );
    assert.deepEqual(
      readableText(tree).filter((text) => prototype.has(text)),
      BRAND_MARK,
    );
  });
});

describe('BrandLogo compact and mark variants', () => {
  for (const size of ['compact', 'mark'] as const) {
    it(`render no tagline under the ${size} variant, even when one is passed`, () => {
      const text = textNodes(
        renderStatic(<BrandLogo size={size} tagline="Ingénierie senior." />),
      );
      assert.ok(!text.includes('Ingénierie senior.'));
      assert.ok(!text.includes(PROTOTYPE_TAGLINE));
    });
  }
});
