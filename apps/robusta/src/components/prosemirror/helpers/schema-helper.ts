import { Node, Schema } from 'prosemirror-model'

// Helper to validate a Node against the schema

export function validateNodeAgainstSchema(node: Node, schema: Schema) {
  const rootType = schema.nodes.doc // Ensure the top-level node type is valid
  if (node.type !== rootType) {
    throw new Error(
      `Invalid content: top-level node must be of type "${rootType.name}".`
    )
  }

  // Recursively validate the node's content
  validateNodeContent(node)
}

function validateNodeContent(node: Node) {
  const match = node.contentMatchAt(0)

  node.forEach(child => {
    if (!match.matchType(child.type)) {
      throw new Error(
        `Invalid child node type: "${child.type.name}" is not allowed inside "${node.type.name}".`
      )
    }

    validateNodeContent(child) // Recurse for nested nodes
  })
}
