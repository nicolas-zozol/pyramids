import { Node } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

export interface ProseEditor {
  view: EditorView
  state: EditorState
}
export type Predicate = (node: Node) => boolean

export interface NodeWithPos {
  node: Node
  pos: number
}

export type HTMLContent = string

export type JSONContent = {
  type?: string
  attrs?: Record<string, any>
  content?: JSONContent[]
  marks?: {
    type: string
    attrs?: Record<string, any>
    [key: string]: any
  }[]
  text?: string
  [key: string]: any
}

export type Content = HTMLContent | JSONContent | JSONContent[] | null
