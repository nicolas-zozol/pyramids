import { EditorState, Transaction } from 'prosemirror-state'
import { Node, Schema } from 'prosemirror-model'

import { findNodeByName } from '../helpers/state-helper'
import { NodeWithPos } from '../helpers/types'
import { MODE } from '@/components/prosemirror/autocomplete/mode'

export function detectWritingIntoTemporary(state: EditorState): boolean {
  return findTemporary(state) !== null
  /*
  const json = state.doc.toJSON()
  let containsTemporary = false
  if (json && json.content) {
    containsTemporary = json.content.some(
      (node: any) => node.type === 'temporary'
    )
  }
  return containsTemporary*/
}

export function findTemporary(state: EditorState): NodeWithPos | null {
  return findNodeByName(state, 'temporary')
}

// Helper to extract the match string (text without @ symbol)
export function extractMatchString(state: EditorState, mode: MODE): string {
  const node = findTemporary(state)
  if (!node) {
    return ''
  }
  const discriminator = mode === 'FLOW' ? 2 : 1

  return node.node.textContent?.substring(discriminator) || ''
}

// TODO: replace ths with a transaction
export function replaceTemporaryNode(state: EditorState): Transaction {
  const { tr } = state
  const nodeWithPos = findTemporary(state)
  if (!nodeWithPos) {
    return tr
  }
  const { node, pos } = nodeWithPos
  const text = node.textContent || ''
  return replaceNodeByText(tr, state.schema, node, pos, text)
}

export function replaceNodeByText(
  tr: Transaction,
  schema: Schema,
  node: Node,
  pos: number,
  text: string
): Transaction {
  const nodeSize = node.nodeSize
  return tr.replaceWith(pos, pos + nodeSize, schema.text(text))
}
