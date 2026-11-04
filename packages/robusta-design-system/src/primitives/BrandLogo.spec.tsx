import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  readableText,
  renderStatic,
  textNodes,
  type HostElement,
} from '../test-support/render-static.ts';
import { BrandLogo } from './BrandLogo.tsx';

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
  it('renders the lockup alone when no tagline is given', () => {
    const tree = renderStatic(<BrandLogo size="full" />);
    assert.equal(rootOf(tree).children.length, 1);
    assert.deepEqual(readableText(tree), BRAND_MARK);
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

  it('lets the brand mark and the tagline it is given alone reach the reader', () => {
    const tree = renderStatic(
      <BrandLogo size="full" tagline="Ingénierie senior, faite main." />,
    );
    assert.deepEqual(readableText(tree), [
      '💪',
      '🏗',
      'Ingénierie senior, faite main.',
      'Robusta Build',
    ]);
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
