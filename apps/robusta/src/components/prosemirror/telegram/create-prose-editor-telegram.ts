import { EditorState, Transaction } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'
import { telegramSchema } from './telegram-schema'
import { telegramCommands } from './telegram-commands'
import { transformStopToEnd, truncateAfterEndPlugin } from './telegram-plugin'
import { dispatchTelegramTransaction } from './dispatch-telegram-transaction'
import { ProseEditor } from '@/components/prosemirror/helpers/types'

export function createProseEditorTelegram(domElement: Element): ProseEditor {
  const state = EditorState.create({
    schema: telegramSchema,
    plugins: [telegramCommands, transformStopToEnd, truncateAfterEndPlugin],
  })

  const view = new EditorView(domElement, {
    state,

    dispatchTransaction: transaction => {
      dispatchTelegramTransaction(view, transaction)
    },
  })
  return { view, state }
}
