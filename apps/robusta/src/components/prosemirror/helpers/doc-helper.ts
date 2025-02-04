import { Fragment, Node, Schema, DOMParser } from 'prosemirror-model'

export function createDocFromContent(
  content: string | Node | Fragment,
  schema: Schema
): Node {
  return wrapAsDoc(createNodeFromContent(content, schema), schema)
}

export function isDocEmpty(doc: Node): boolean {
  return doc.content.size === 0 && doc.type.name === 'doc'
}

export function createNodeFromContent(
  content: string | Node | Fragment,
  schema: Schema
): Node | Fragment {
  if (content instanceof Node || content instanceof Fragment) {
    return content
  }

  const parser = DOMParser.fromSchema(schema)
  const domNodes = stringToDOMNode(content)
  if (domNodes.length === 0) {
    const template = document.createElement('template')
    template.innerHTML = content.trim()
    return parser.parse(template.content)
  }
  if (domNodes.length === 1) {
    const document = parser.parse(domNodes[0], {})
    return document.content.content[0]
  }

  const allNodes = domNodes.map(
    domNode => parser.parse(domNode, {}).content.content[0]
  )

  return Fragment.fromArray(allNodes)
}

export function stringToDOMNode(
  htmlString: string
): readonly globalThis.Node[] {
  if (typeof document === 'undefined') {
    throw new Error(
      'stringToDOMNode requires a DOM. Make sure to use it in a browser or jsdom environment.'
    )
  }
  const template = document.createElement('template')
  template.innerHTML = htmlString.trim()
  return Array.from(template.content.childNodes) as readonly globalThis.Node[]
}

export function wrapAsDoc(
  nodeOrFragment: Node | Fragment,
  schema: Schema
): Node {
  // Ensure the input is a Fragment
  if (nodeOrFragment instanceof Node && nodeOrFragment.type.name === 'doc') {
    return nodeOrFragment
  }

  if (nodeOrFragment instanceof Node) {
    return schema.node('doc', null, nodeOrFragment)
  } else {
    return schema.node('doc', null, nodeOrFragment)
  }
}
