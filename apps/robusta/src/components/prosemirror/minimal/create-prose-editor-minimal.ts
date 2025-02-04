import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { minimalSchema } from './minimal-schema'
import { ProseEditor } from '@/components/prosemirror/helpers/types'

export function createProseEditorMinimal(domElement: Element): ProseEditor {
  const state = EditorState.create({
    schema: minimalSchema,
    plugins: [], // minimalSchemaWithParagraph needs keymap
  })

  const view = new EditorView(domElement, {
    state,

    dispatchTransaction: transaction => {
      dispatchBasicTransaction(view, transaction)
    },
  })
  return { view, state }
}

function dispatchBasicTransaction(view: EditorView, transaction: Transaction) {
  console.log('Transaction update', transaction)
  const newState = view.state.apply(transaction)
  view.updateState(newState)
}
