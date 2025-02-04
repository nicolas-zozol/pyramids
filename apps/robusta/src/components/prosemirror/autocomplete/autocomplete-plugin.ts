import {
  Command,
  EditorState,
  TextSelection,
  Transaction,
} from 'prosemirror-state'
import { keymap } from 'prosemirror-keymap'
import { EditorView } from 'prosemirror-view'
import {
  AutocompleteBox,
  getAutocompleteBox,
  isBoxOpened,
} from './autocomplete-ui'
import {
  detectWritingIntoTemporary,
  extractMatchString,
  findTemporary,
  replaceTemporaryNode,
} from './autocomplete-helpers'
import { getFakerByMode, getSchemaTypeByMode, MODE } from './mode'
import { getContentAt } from '@/components/prosemirror/helpers/state-helper'

/**
 * This file handle the special keys and commands for the autocomplete feature.
 * It is responsible for handling the `@`, '#', '<>', 'Up & Down', 'Escape', and the Enter key.
 *
 * However, other keys also interact with the autocomplete box, by updating the content of the box
 * or even exiting it when no content is available.
 * This is done in the dispatchAutocompleteTransaction function.
 *
 */

const doEnter: Command = () => {
  if (isBoxOpened()) {
    const box = getAutocompleteBox()!
    const activeItem = box.getActiveItem()
    if (!activeItem) {
      return false
    } else {
      box.onSelect(activeItem)
      return true
    }
  }

  // nothing to select, make a paragraph with classic plugin
  return false
}

// Keymap handler for the `@` character
const handleAtKey: Command = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
  view?: EditorView
) => {
  if (!view) return false
  if (isBoxOpened()) {
    return false
  }
  const { schema, tr } = state
  const caretPosition = state.selection.$from.pos

  // Create a temporary node with an empty string as content
  const temporaryNode = schema.nodes.temporary.create({}, schema.text('@'))
  if (dispatch) {
    tr.insert(caretPosition, temporaryNode)
    const endPosition = caretPosition + 2
    tr.setSelection(TextSelection.create(tr.doc, endPosition))

    dispatch(tr)
  }

  showAutocompleteBox('PEOPLE', view)
  return true // Indicate the key was handled
}

const handleHashKey: Command = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
  view?: EditorView
) => {
  if (!view) return false
  if (isBoxOpened()) {
    return false
  }
  const { schema, tr } = state
  const caretPosition = state.selection.$from.pos

  // Create a temporary node with an empty string as content
  const temporaryNode = schema.nodes.temporary.create({}, schema.text('#'))
  if (dispatch) {
    tr.insert(caretPosition, temporaryNode)
    const endPosition = caretPosition + 2
    tr.setSelection(TextSelection.create(tr.doc, endPosition))
    dispatch(tr)
  }

  showAutocompleteBox('HASHTAG', view)
  return true
}

const handleFlowKey: Command = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void,
  view?: EditorView
) => {
  if (!view) return false
  if (isBoxOpened() && dispatch) {
    return false
  }

  const { schema, tr } = state
  const caretPosition = state.selection.$from.pos
  const previousChar = getContentAt(state, caretPosition - 1, 1)
  const isFlowChar = previousChar === '<'

  if (!isFlowChar) {
    // Not in the <> combination
    return false
  }

  // Create a temporary node with an empty string as content
  const temporaryNode = schema.nodes.temporary.create({}, schema.text('<>'))
  if (dispatch) {
    tr.replaceWith(caretPosition - 1, caretPosition, temporaryNode)

    const endPosition = caretPosition + 2
    tr.setSelection(TextSelection.create(tr.doc, endPosition))

    dispatch(tr)
  }
  showAutocompleteBox('FLOW', view)
  return true
}

const handleDelInterception: Command = (
  state: EditorState,
  dispatch?: (tr: Transaction) => void
) => {
  const previousState = state

  // Apply a dummy transaction for DEL
  let transaction = state.tr.delete(
    Math.max(0, state.selection.from - 1), // Go one step backward
    state.selection.to || state.selection.from
  )
  let newState = state.apply(transaction)

  // Check if we were writing into the `temporaryPeople` node
  const wasWritingBefore = detectWritingIntoTemporary(previousState)
  const isWritingAfter = detectWritingIntoTemporary(newState)

  const temporary = findTemporary(newState)
  let temporaryEmpty = false
  if (temporary) {
    if (temporary.node.textContent === '') {
      temporaryEmpty = true
      // adding to the transaction
      transaction = state.tr.delete(
        Math.max(0, state.selection.from - 2), // Go one step backward
        state.selection.to || state.selection.from
      )
    }
  }

  if (temporaryEmpty || (wasWritingBefore && !isWritingAfter)) {
    // Node was removed, reset the autocomplete box
    getAutocompleteBox()?.exit()
  }

  // Let ProseMirror handle the actual delete operation
  if (dispatch) {
    dispatch(transaction)
  }
  return true
}

const handleNavigation: (key: string) => Command = key => {
  return () => {
    if (isBoxOpened()) {
      const box = getAutocompleteBox()!
      box.handleKeyDown(key)
      return true
    } else {
      return false
    }
  }
}

const handleSpace: Command = (state: EditorState) => {
  if (isBoxOpened()) {
    const box = getAutocompleteBox()!

    if (box.mode !== 'HASHTAG') {
      return false
    }
    const matchString = extractMatchString(state, 'HASHTAG')
    box.onSelect(matchString)
    return true
  } else {
    return false
  }
}

export const autocompleteCommands = keymap({
  Enter: doEnter,
  Tab: doEnter,
  '@': handleAtKey,
  '#': handleHashKey,
  '>': handleFlowKey,
  Delete: handleDelInterception,
  Backspace: handleDelInterception,
  ArrowDown: handleNavigation('ArrowDown'),
  ArrowUp: handleNavigation('ArrowUp'),
  Escape: handleNavigation('Escape'),
  Space: handleSpace,
})

// Function to show the autocomplete box
function showAutocompleteBox(mode: MODE, view: EditorView): AutocompleteBox {
  const rect = view.dom.getBoundingClientRect()
  const cursorPos = view.coordsAtPos(view.state.selection.$from.pos)

  const x = cursorPos.left - rect.left
  const y = cursorPos.top - rect.top

  const faker = getFakerByMode(mode)

  const autocomplete = new AutocompleteBox(mode, {
    container: view.dom.parentElement as HTMLElement,
    fetch: faker,
    onSelect: item => {
      console.log('Selected:', item)
      insertModeNode(view, item, mode) // Insert the selected person node
      autocomplete.exit()
    },
    onClose: () => {
      view.dispatch(replaceTemporaryNode(view.state))
    },
    onNoMatch: matchString => {
      handleNoMatch(matchString, mode, view)
    },
  })

  autocomplete.setPosition(x + 10, y + 25) // Adjust position
  autocomplete
    .update('') // Initialize with the current match string
    .catch(error => {
      console.error('Error fetching autocomplete items:', error)
    })

  return autocomplete // Return the instance for external updates
}

// Function to handle inserting a PeopleNode
function insertModeNode(view: EditorView, name: string, mode: MODE): void {
  const { state, dispatch } = view
  const { schema, tr } = state

  const tempNode = findTemporary(state)
  if (tempNode) {
    const { node, pos } = tempNode

    const modeNode = getSchemaTypeByMode(schema, mode).create({ name })

    const transaction = tr.replaceWith(pos, pos + node.nodeSize, modeNode)
    tr.insertText(' ')
    dispatch(transaction)
  }
}

function handleNoMatch(matchString: string, mode: MODE, view: EditorView) {
  const { state, dispatch } = view
  const box = getAutocompleteBox()
  if (mode === 'PEOPLE') {
    const trRemovingPeople = replaceTemporaryNode(state)
    view.dispatch(trRemovingPeople)
    box?.exit()
    return
  } else {
    box?.setContinueAndEnterItem(matchString)
  }
}
