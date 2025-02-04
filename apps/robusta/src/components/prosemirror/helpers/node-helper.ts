import { DOMSerializer, Fragment, Node, Schema } from 'prosemirror-model'
import { NodeWithPos, Predicate } from './types.js'

export function findChildren(node: Node, predicate: Predicate): NodeWithPos[] {
  const nodesWithPos: NodeWithPos[] = []

  node.descendants((child, pos) => {
    if (predicate(child)) {
      nodesWithPos.push({
        node: child,
        pos,
      })
    }
  })

  return nodesWithPos
}

export function findFirstChild(node: Node, type: string): NodeWithPos | null {
  let found: NodeWithPos | null = null

  node.descendants((child, pos) => {
    if (child.type.name === type && !found) {
      found = { node: child, pos }
      return
    }
  })

  return found
}

export function nodeToHtml(node: Node, schema: Schema): string {
  const serializer = DOMSerializer.fromSchema(schema)

  const container = document.createElement('div')
  container.appendChild(serializer.serializeNode(node))
  // Return the serialized HTML as a string
  return container.innerHTML
}

export function fragmentToHtml(fragment: Fragment, schema: Schema): string {
  const serializer = DOMSerializer.fromSchema(schema)

  const container = document.createElement('div')

  fragment.forEach(childNode => {
    container.appendChild(serializer.serializeNode(childNode))
  })

  // Return the serialized HTML as a string
  return container.innerHTML
}
