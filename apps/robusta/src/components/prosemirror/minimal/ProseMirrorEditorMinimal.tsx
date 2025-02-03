'use client'

import { useEffect, useRef } from 'react'
import { createProseEditorMinimal } from './create-prose-editor-minimal'

export const ProseMirrorEditorMinimal = () => {
  const editorRef = useRef(null)

  useEffect(() => {
    const editorItem = document.querySelector('#editor-minimal')!
    const { view } = createProseEditorMinimal(editorItem)

    return () => {
      view.destroy()
    }
  }, [])

  return (
    <div
      id="editor-minimal"
      ref={editorRef}
      className={'ProseMirror editor'}
    ></div>
  )
}
