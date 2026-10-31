import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { byTag, renderStatic } from '../test-support/render-static.js';
import { FlowDiagram } from './FlowDiagram.js';

function sectionOf(node: Parameters<typeof renderStatic>[0]) {
  const [section] = byTag(renderStatic(node), 'section');
  assert.ok(section, 'the flow diagram renders one section');
  return section;
}

describe('FlowDiagram id', () => {
  it('becomes the id of its section', () => {
    assert.equal(
      sectionOf(<FlowDiagram id="open-source" />).props.id,
      'open-source',
    );
  });

  it('is approach when absent', () => {
    assert.equal(sectionOf(<FlowDiagram />).props.id, 'approach');
  });

  it('lets two diagrams of one page carry two ids', () => {
    const ids = byTag(
      renderStatic(
        <>
          <FlowDiagram id="open-source" />
          <FlowDiagram id="complete" />
        </>,
      ),
      'section',
    ).map((section) => section.props.id);
    assert.deepEqual(ids, ['open-source', 'complete']);
  });
});

describe('FlowDiagram rendered without an id', () => {
  it('writes the section attributes it wrote before, in the same order', () => {
    assert.deepEqual(Object.entries(sectionOf(<FlowDiagram />).props), [
      ['id', 'approach'],
      ['className', 'sk-flow-diagram'],
      ['style', undefined],
    ]);
  });

  it('renders the same tree as with id approach', () => {
    assert.deepEqual(
      renderStatic(<FlowDiagram />),
      renderStatic(<FlowDiagram id="approach" />),
    );
  });
});
