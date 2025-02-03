'use client'
import { useEffect, useRef } from 'react'
import { createProseEditorTelegram } from './create-prose-editor-telegram'
import './telegram.scss'

export const ProseMirrorEditorTelegram = () => {
  const editorRef = useRef(null)

  useEffect(() => {
    const editorItem = document.querySelector('#editor-telegram')!
    const { view } = createProseEditorTelegram(editorItem)

    return () => {
      view.destroy()
    }
  }, [])

  return (
    <div
      id="editor-telegram"
      ref={editorRef}
      className={'ProseMirror editor'}
    ></div>
  )
}
