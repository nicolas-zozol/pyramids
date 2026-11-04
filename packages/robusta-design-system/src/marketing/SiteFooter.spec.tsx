import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  attribute,
  byClass,
  byTag,
  hostElements,
  renderStatic,
  textNodes,
} from '../test-support/render-static.ts';
import { SiteFooter } from './SiteFooter.tsx';

describe('SiteFooter item', () => {
  const tree = renderStatic(
    <SiteFooter
      columns={[
        {
          h: 'notes',
          items: [
            { label: 'articles', href: '/articles' },
            { label: 'bientôt' },
          ],
        },
      ]}
    />,
  );
  const [linked, unlinked] = byTag(
    byClass(tree, 'sk-site-footer__items'),
    'li',
  );

  it('with a destination is an anchor to it', () => {
    const [anchor] = byTag([linked], 'a');
    assert.equal(attribute(anchor, 'href'), '/articles');
    assert.deepEqual(textNodes([anchor]), ['articles']);
  });

  it('without a destination is its label as text, carrying no anchor and no #', () => {
    assert.deepEqual(textNodes([unlinked]), ['bientôt']);
    assert.equal(byTag([unlinked], 'a').length, 0);
    assert.ok(
      hostElements([unlinked]).every((element) => !('href' in element.props)),
    );
  });
});

describe('SiteFooter rendered without text', () => {
  const tree = renderStatic(<SiteFooter wordmarkSrc="/wordmark.png" />);

  it('renders no column, no tagline and no bottom line, the bottom row staying', () => {
    assert.equal(byClass(tree, 'sk-site-footer__col').length, 0);
    assert.equal(byClass(tree, 'sk-site-footer__tagline').length, 0);
    const [bottom] = byClass(tree, 'sk-site-footer__bottom');
    assert.ok(bottom, 'the bottom row is rendered');
    assert.deepEqual(bottom.children, []);
  });

  it('hides the version line it is given empty, the copyright alone staying', () => {
    const [bottom] = byClass(
      renderStatic(<SiteFooter copyright="© Robusta Build" versionLine="" />),
      'sk-site-footer__bottom',
    );
    assert.equal(bottom.children.length, 1);
    assert.deepEqual(textNodes([bottom]), ['© Robusta Build']);
  });
});
