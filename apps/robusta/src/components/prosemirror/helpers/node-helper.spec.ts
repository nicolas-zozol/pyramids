import { Schema, Node } from 'prosemirror-model'
import { findChildren, findFirstChild } from './node-helper'
import { createDocFromContent } from './doc-helper' // Optional utility for creating docs

// Define the schema for the tests
const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { content: 'inline*', group: 'block' },
    text: { group: 'inline' },
    heading: {
      content: 'inline*',
      group: 'block',
      attrs: { level: { default: 1 } },
    },
  },
})

// Utility to create a doc for tests (optional)
function createTestDoc(content: string): Node {
  return createDocFromContent(content, schema)
}

describe('findChildren', () => {
  test('finds all paragraphs in a document', () => {
    const doc = createTestDoc('<p>Paragraph 1</p><p>Paragraph 2</p>')
    const predicate = (node: Node) => node.type.name === 'paragraph'

    const result = findChildren(doc, predicate)

    expect(result).toHaveLength(2)
    expect(result[0].node.type.name).toBe('paragraph')
    expect(result[1].node.type.name).toBe('paragraph')
  })

  test('finds all text nodes in a document', () => {
    const doc = createTestDoc('<p>Text 1</p><p>Text 2</p>')
    const predicate = (node: Node) => node.isText

    const result = findChildren(doc, predicate)

    expect(result).toHaveLength(2)
    expect(result[0].node.textContent).toBe('Text 1')
    expect(result[1].node.textContent).toBe('Text 2')
  })

  test('returns an empty array if no children match', () => {
    const doc = createTestDoc('<p>No match here</p>')
    const predicate = (node: Node) => node.type.name === 'heading'

    const result = findChildren(doc, predicate)

    expect(result).toEqual([])
  })

  test('finds deeply nested nodes', () => {
    const doc = createTestDoc('<p><span>Deep Text</span></p>')
    const predicate = (node: Node) => node.isText

    const result = findChildren(doc, predicate)

    expect(result).toHaveLength(1)
    expect(result[0].node.textContent).toBe('Deep Text')
  })

  test('finds the first paragraph in a document', () => {
    const doc = createDocFromContent(
      '<p>Paragraph 1</p><p>Paragraph 2</p>',
      schema
    )
    const result = findFirstChild(doc, 'paragraph')

    expect(result).not.toBeNull()
    expect(result!.node.type.name).toBe('paragraph')
    expect(result!.node.textContent).toBe('Paragraph 1')
  })

  test('returns null if no matching child is found', () => {
    const doc = createDocFromContent('<p>No match here</p>', schema)
    const result = findFirstChild(doc, 'heading')

    expect(result).toBeNull()
  })

  test('finds deeply nested nodes', () => {
    const doc = createDocFromContent('<p><span>Deep Text</span></p>', schema)
    const result = findFirstChild(doc, 'text')

    expect(result).not.toBeNull()
    expect(result?.node.isText).toBe(true)
    expect(result?.node.textContent).toBe('Deep Text')
  })
})
