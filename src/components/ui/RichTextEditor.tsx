'use client'

import * as React from 'react'
import { Editor } from './rich-text-editor/editor'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  contentClassName?: string
  disabled?: boolean
  toolbarPosition?: 'top' | 'bottom'
  actions?: React.ReactNode
  onImageClick?: () => void
}

export function RichTextEditor(props: RichTextEditorProps) {
  return <Editor {...props} />
}
