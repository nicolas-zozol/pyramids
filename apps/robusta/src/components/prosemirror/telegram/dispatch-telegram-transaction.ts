import { EditorView } from 'prosemirror-view'
import { Transaction } from 'prosemirror-state'

export function dispatchTelegramTransaction(
  view: EditorView,
  transaction: Transaction
) {
  if (transaction.steps.length > 1) {
    console.log('Transaction update', transaction.steps[0].toJSON())
  } else {
    console.log('Transaction update', transaction)
  }

  const newState = view.state.apply(transaction)
  view.updateState(newState)
}
