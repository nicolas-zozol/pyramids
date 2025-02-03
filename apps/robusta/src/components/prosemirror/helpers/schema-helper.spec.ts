import { Schema } from 'prosemirror-model'
import { validateNodeAgainstSchema } from './schema-helper'

describe('validateNodeAgainstSchema', () => {
  const paragraphSchema = new Schema({
    nodes: {
      doc: { content: 'block*' },
      paragraph: { group: 'block', content: 'inline*' },
      text: { group: 'inline' },
    },
  })

  const textSchema = new Schema({
    nodes: {
      doc: {
        content: 'text*',
      },
      text: {},
    },
  })

  const createNode = (type: string, content: string = '') => {
    return paragraphSchema.node(
      type,
      null,
      content ? paragraphSchema.text(content) : undefined
    )
  }

  test('validates a correct top-level node', () => {
    const validDoc = paragraphSchema.node('doc', null, [
      createNode('paragraph', 'Hello'),
    ])
    expect(() =>
      validateNodeAgainstSchema(validDoc, paragraphSchema)
    ).not.toThrow()
  })

  test('throws error for invalid top-level node', () => {
    const invalidDoc = createNode('paragraph', 'This is not a doc node')
    expect(() =>
      validateNodeAgainstSchema(invalidDoc, paragraphSchema)
    ).toThrow('Invalid content: top-level node must be of type "doc".')
  })

  test('throws error for invalid child node type', () => {
    const textNode = textSchema.text('Invalid child')

    expect(() => validateNodeAgainstSchema(textNode, paragraphSchema))
      .toThrow
      //'Invalid child node type: "text" is not allowed inside "doc".'
      ()
  })

  test('validates nested child nodes correctly', () => {
    const validNestedDoc = paragraphSchema.node('doc', null, [
      paragraphSchema.node(
        'paragraph',
        null,
        paragraphSchema.text('Nested content')
      ),
    ])
    expect(() =>
      validateNodeAgainstSchema(validNestedDoc, paragraphSchema)
    ).not.toThrow()
  })

  test('validates empty valid doc', () => {
    const emptyDoc = paragraphSchema.node('doc', null, [])
    expect(() =>
      validateNodeAgainstSchema(emptyDoc, paragraphSchema)
    ).not.toThrow()
  })

  test('throws error for invalid empty top-level node', () => {
    const invalidEmptyDoc = paragraphSchema.node('paragraph', null, [])
    expect(() =>
      validateNodeAgainstSchema(invalidEmptyDoc, paragraphSchema)
    ).toThrow('Invalid content: top-level node must be of type "doc".')
  })
})
