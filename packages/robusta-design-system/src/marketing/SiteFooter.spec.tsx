import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  attribute,
  byClass,
  byTag,
  hostElements,
  renderStatic,
  textNodes,
} from '../test-support/render-static.js';
import { SiteFooter } from './SiteFooter.js';

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

describe('SiteFooter default columns', () => {
  it('declare no destination, the package knowing no site URL', () => {
    const columns = byClass(
      renderStatic(<SiteFooter />),
      'sk-site-footer__col',
    );
    assert.equal(columns.length, 3);
    assert.equal(byTag(columns, 'a').length, 0);
    assert.equal(byTag(columns, 'li').length, 12);
  });
});
