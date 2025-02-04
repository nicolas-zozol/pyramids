import { Schema, NodeSpec, MarkSpec } from 'prosemirror-model'

const minimalNodes: Record<string, NodeSpec> = {
  doc: {
    content: 'text*',
  },
  text: {},
}

const minimalMarks: Record<string, MarkSpec> = {}

export const minimalSchema = new Schema({
  nodes: minimalNodes,
  marks: minimalMarks,
})

const minimalNodesWithParagraph: Record<string, NodeSpec> = {
  doc: {
    content: 'block+', // The document requires one or more block nodes
  } as NodeSpec,
  paragraph: {
    content: 'inline*', // Paragraphs can contain zero or more inline nodes
    group: 'block', // Paragraph belongs to the 'block' group
    parseDOM: [{ tag: 'p' }], // Parse <p> tags as paragraph nodes
    toDOM: () => ['p', 0], // Render paragraphs as <p>...</p>
  } as NodeSpec,
  text: {
    group: 'inline', // Text is part of the 'inline' group
  } as NodeSpec,
}

export const minimalSchemaWithParagraph = new Schema({
  nodes: minimalNodesWithParagraph,
  marks: minimalMarks,
})
