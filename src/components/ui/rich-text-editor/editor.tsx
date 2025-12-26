'use client'

import * as React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { extensions } from './extensions'
import { EditorToolbar } from './toolbar'
import { cn } from '@/lib/utils'

interface EditorProps {
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

export function Editor({
  value,
  onChange,
  placeholder,
  className,
  contentClassName,
  disabled,
  toolbarPosition = 'top',
  actions,
  onImageClick
}: EditorProps) {
  const editor = useEditor({
    extensions,
    content: value,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base dark:prose-invert focus:outline-none max-w-none min-h-[150px] p-4',
          contentClassName
        ),
      },
    },
    immediatelyRender: false,
  })

  // Update content if value changes externally
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [value, editor])

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-md border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring flex flex-col',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {toolbarPosition === 'top' && <EditorToolbar editor={editor} actions={actions} onImageClick={onImageClick} />}
      <EditorContent editor={editor} className="flex-1" />
      {toolbarPosition === 'bottom' && (
        <div className="border-t border-slate-100 bg-slate-50/30">
          <EditorToolbar editor={editor} actions={actions} onImageClick={onImageClick} />
        </div>
      )}
    </div>
  )
}
