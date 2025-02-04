import { Schema, NodeSpec, MarkSpec } from 'prosemirror-model'

const telegramNodes: Record<string, NodeSpec> = {
  doc: {
    content: 'inline*',
  },
  text: {
    group: 'inline',
  },
  // STOP node represented as <em>STOP</em>
  stop: {
    group: 'inline', // This makes it inline content
    inline: true, // Indicates it's an inline node
    atom: true, // Makes it a self-contained, indivisible unit
    toDOM: () => ['em', { class: 'stop' }, 'STOP'], // Rendered as <em>STOP</em>
    parseDOM: [
      {
        tag: 'em',
        getAttrs: node => (node.textContent === 'STOP' ? {} : false),
      },
    ],
  } as NodeSpec,
  end: {
    group: 'inline',
    inline: true,
    atom: true,
    toDOM: () => ['strong', { class: 'end' }, 'END'],
    parseDOM: [
      {
        tag: 'strong',
        getAttrs: node => (node.textContent === 'END' ? {} : false),
      },
    ],
  },
}

const telegramMarks: Record<string, MarkSpec> = {}

export const telegramSchema = new Schema({
  nodes: telegramNodes,
  marks: telegramMarks,
})
