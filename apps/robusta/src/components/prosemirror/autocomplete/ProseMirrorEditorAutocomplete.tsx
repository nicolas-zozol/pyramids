'use client'

import { useEffect, useRef } from 'react'
import { createProseEditorAutocomplete } from './create-prose-editor-autocomplete'
import './autocomplete.scss'

export const ProseMirrorEditorAutocomplete = () => {
  const parentRef = useRef(null)
  const editorRef = useRef(null)

  useEffect(() => {
    const editorItem = document.querySelector('#editor-autocomplete')!
    const { view } = createProseEditorAutocomplete(editorItem)

    return () => {
      view.destroy()
    }
  }, [])

  return (
    <div ref={parentRef} className={'autocomplete-root'}>
      <div
        id="editor-autocomplete"
        ref={editorRef}
        className={'ProseMirror editor'}
      ></div>
    </div>
  )
}
