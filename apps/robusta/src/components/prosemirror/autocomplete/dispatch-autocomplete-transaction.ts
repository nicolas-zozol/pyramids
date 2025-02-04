import { EditorView } from 'prosemirror-view'
import { Transaction } from 'prosemirror-state'
import { getAutocompleteBox } from './autocomplete-ui'
import {
  detectWritingIntoTemporary,
  extractMatchString,
  findTemporary,
  replaceNodeByText,
} from './autocomplete-helpers'

/**
 * This function is responsible for handling the autocomplete box when the user types
 * regular text into the editor.
 * @param view
 * @param transaction
 */

export function dispatchAutocompleteTransaction(
  view: EditorView,
  transaction: Transaction
) {
  let newState = view.state.apply(transaction)
  view.updateState(newState)

  const box = getAutocompleteBox()
  const tempNode = findTemporary(newState)

  // Dispatch intercepted to modify the box UI
  // Equivalent of a useEffect, modifies only outside the ProseMirror system
  if (box && tempNode) {
    const matchString = extractMatchString(newState, box.mode)

    box
      .update(matchString)
      .then(active => {
        if (active.found) {
          //.console.log('## active', active.found)
        } else {
          //console.log('## not active')
        }
      })
      .catch(console.error)
  } else {
    //console.log('Not writing into temporary')
  }
}
