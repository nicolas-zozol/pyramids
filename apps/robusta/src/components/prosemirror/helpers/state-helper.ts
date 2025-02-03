import { EditorState, Selection, Transaction } from 'prosemirror-state'
import { NodeWithPos, Predicate } from './types'
import { ResolvedPos, Node } from 'prosemirror-model'

export function findNodeByName(
  state: EditorState,
  type: string
): NodeWithPos | null {
  let found: NodeWithPos | null = null
  state.doc.descendants((child, pos) => {
    if (child.type.name === type && !found) {
      found = { node: child, pos }
      return
    }
  })

  return found
}
export const isAtStartOfNode = (state: EditorState) => {
  const { $from, $to } = state.selection

  if ($from.parentOffset > 0 || $from.pos !== $to.pos) {
    return false
  }

  return true
}

export const isAtEndOfNode = (state: EditorState, nodeType?: string) => {
  const { $from, $to, $anchor } = state.selection

  if (nodeType) {
    const parentNode = findParentNode(node => node.type.name === nodeType)(
      state.selection
    )

    if (!parentNode) {
      return false
    }

    const $parentPos = state.doc.resolve(parentNode.pos + 1)

    if ($anchor.pos + 1 === $parentPos.end()) {
      return true
    }

    return false
  }

  if ($to.parentOffset < $to.parent.nodeSize - 2 || $from.pos !== $to.pos) {
    return false
  }

  return true
}

export function findParentNode(predicate: Predicate) {
  return (selection: Selection) =>
    findParentNodeClosestToPos(selection.$from, predicate)
}

export function findParentNodeClosestToPos(
  $pos: ResolvedPos,
  predicate: Predicate
):
  | {
      pos: number
      start: number
      depth: number
      node: Node
    }
  | undefined {
  for (let i = $pos.depth; i > 0; i -= 1) {
    const node = $pos.node(i)

    if (predicate(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node,
      }
    }
  }
}

export function getContentAt(
  state: EditorState,
  pos: number,
  range: number = 1
) {
  const doc = state.doc

  // Ensure the range doesn't go out of bounds
  const start = pos
  const end = Math.min(doc.content.size, pos + range)

  // Extract text content within the range
  return doc.textBetween(start, end, '\n', '\uFFFC') // \uFFFC for leaf nodes
}

export function removeNode(
  state: EditorState,
  node: Node,
  pos: number
): Transaction {
  const tr = state.tr
  tr.delete(pos, pos + node.nodeSize)
  return tr
}
