'use client'

import * as React from 'react'
import { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup } from '@/components/ui/toggle-group'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface EditorToolbarProps {
  editor: Editor | null
  actions?: React.ReactNode
  onImageClick?: () => void
}

export function EditorToolbar({ editor, actions, onImageClick }: EditorToolbarProps) {
  if (!editor) return null

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex items-center justify-between p-1 bg-background flex-wrap gap-2">
        <div className="flex items-center gap-1 flex-wrap">
          <ToggleGroup type="multiple" className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')}
              tooltip="Bold"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')}
              tooltip="Italic"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')}
              tooltip="Underline"
            >
              <Underline className="h-4 w-4" />
            </ToolbarButton>
          </ToggleGroup>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <ToggleGroup type="multiple" className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })}
              tooltip="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })}
              tooltip="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')}
              tooltip="Quote"
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
          </ToggleGroup>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <ToggleGroup type="multiple" className="flex items-center gap-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')}
              tooltip="Bullet List"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')}
              tooltip="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
          </ToggleGroup>

          <Separator orientation="vertical" className="h-6 mx-1" />

          <div className="flex items-center gap-1">
            <LinkButton editor={editor} />
            {onImageClick ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onImageClick}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Image</TooltipContent>
              </Tooltip>
            ) : (
              <ImageButton editor={editor} />
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center gap-2 pr-1">
            {actions}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}

function ToolbarButton({
  onClick,
  active,
  tooltip,
  children,
  className,
}: {
  onClick: () => void
  active: boolean
  tooltip: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Toggle
          size="sm"
          pressed={active}
          onPressedChange={onClick}
          className={cn('h-8 w-8 p-0', className)}
        >
          {children}
        </Toggle>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}

function LinkButton({ editor }: { editor: Editor }) {
  const [url, setUrl] = React.useState('')

  const handleSetLink = () => {
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    setUrl('')
  }

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Link</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-8"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSetLink()
              }}
            />
            <Button size="sm" onClick={handleSetLink} className="h-8">
              Apply
            </Button>
          </div>
          {editor.isActive('link') && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8 w-full"
              onClick={() => {
                editor.chain().focus().unsetLink().run()
                setUrl('')
              }}
            >
              Remove Link
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function ImageButton({ editor }: { editor: Editor }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `editor/${fileName}`

    try {
      const { error: uploadError, data } = await supabase.storage
        .from('document-uploads')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('document-uploads')
        .getPublicUrl(filePath)

      editor.chain().focus().setImage({ src: publicUrl }).run()
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageUpload}
        disabled={isUploading}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn('h-8 w-8 p-0', isUploading && 'animate-pulse')}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {isUploading ? 'Uploading...' : 'Image'}
        </TooltipContent>
      </Tooltip>
    </>
  )
}
