import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { keymap } from 'prosemirror-keymap'
import { baseKeymap } from 'prosemirror-commands'
import { undo, redo, history } from 'prosemirror-history'

import { autocompleteSchema } from './autocomplete-schema'

import { autocompleteCommands } from './autocomplete-plugin'
import { dispatchAutocompleteTransaction } from './dispatch-autocomplete-transaction'
import { ProseEditor } from '@/components/prosemirror/helpers/types'

export function createProseEditorAutocomplete(
  domElement: Element
): ProseEditor {
  const state = EditorState.create({
    schema: autocompleteSchema,
    plugins: [
      history(),
      keymap({ 'Mod-z': undo, 'Mod-y': redo }),
      autocompleteCommands,
      keymap(baseKeymap),
    ],
  })

  const view = new EditorView(domElement, {
    state,

    dispatchTransaction: transaction => {
      dispatchAutocompleteTransaction(view, transaction)
    },
  })
  return { view, state }
}
