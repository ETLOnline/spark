"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import { Button } from "@/src/components/ui/button"
import { Separator } from "@/src/components/ui/separator"
import {
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify
} from "lucide-react"
import { useEffect, useState } from "react"
import Heading from "@tiptap/extension-heading"
import "./RichEditorFormat.css"
import CharacterCount from "@tiptap/extension-character-count"
import Image from "@tiptap/extension-image"
import { Image as ImageIcon } from "lucide-react"
import { AddImageToTaskAction } from "@/src/server-actions/Tasks/Task"
import Loader from "./Loader/Loader"
import { LoaderSizes } from "./types/loader-types"
import type { Editor as TiptapEditor } from "@tiptap/core"

interface RichTextEditorProps {
  value?: string
  onChange?: (content: string) => void
  image_uploading?: boolean
  editable?: boolean
}

const limit = 1000
export default function RichTextEditor({
  value,
  onChange,
  image_uploading,
  editable
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [loading, setLoading] = useState(false)

  const CustomImage = Image.extend({
    addNodeView() {
      return ({ node, getPos, editor }) => {
        // Create wrapper
        const dom = document.createElement("div")
        dom.className =
          "tiptap-image-wrapper relative inline-block group max-w-full overflow-hidden align-middle **max-w-xs**"

        // Create image
        const img = document.createElement("img")
        img.src = node.attrs.src
        img.className =
          "rounded-md max-w-full h-auto object-contain transition-all duration-200 ease-in-out"
        img.onload = () => {
          img.style.opacity = "1"
        }

        dom.appendChild(img)

        // Create delete button
        const deleteBtn = document.createElement("button")
        deleteBtn.textContent = "✕"
        deleteBtn.className =
          "absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 hover:bg-black"

        deleteBtn.onclick = (e) => {
          e.stopPropagation()
          editor
            .chain()
            .focus()
            .deleteRange({ from: getPos(), to: getPos() + node.nodeSize })
            .run()
        }

        dom.appendChild(deleteBtn)

        return { dom }
      }
    }
  })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Heading.configure({ levels: [1, 2, 3] }),
      CharacterCount.configure({ limit }),
      CustomImage.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: "CustomImage"
        }
      })
    ],
    content: value,
    editable,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-4"
      },

      handlePaste(view, event) {
        if (!image_uploading) return false

        const items = event.clipboardData?.items
        if (!items) return false

        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile()
            if (!file) return false

            setLoading(true)
            const reader = new FileReader()
            reader.onload = async () => {
              const base64String = reader.result as string

              try {
                const res = await AddImageToTaskAction(
                  file.name,
                  base64String,
                  file.type
                )
                if (res.success && res.data) {
                  editor
                    ?.chain()
                    .focus()
                    .insertContentAt(editor.state.selection.head, [
                      { type: "image", attrs: { src: res.data } },
                      { type: "paragraph" }
                    ])
                    .focus()
                    .run()

                  setLoading(false)
                }
              } catch {
                console.error("Failed to upload pasted image")
                setLoading(false)
              }
            }
            reader.readAsDataURL(file)

            return true
          }
        }
        return false
      }
    },
    onUpdate({ editor }) {
      const html = editor.getHTML()
      if (onChange) {
        onChange(html)
      }
    }
  })

  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value, false)
    }
  }, [value, editor])

  if (!editor) {
    return null
  }

  const addLink = () => {
    if (linkUrl) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run()
      setLinkUrl("")
      setShowLinkInput(false)
    }
  }

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run()
  }

  const handleUploadImage = () => {
    const fileInput = document.createElement("input")
    fileInput.type = "file"
    fileInput.accept = "image/*"
    fileInput.onchange = () => {
      setLoading(true)

      const file = fileInput.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = async () => {
        const base64String = reader.result as string

        try {
          const res = await AddImageToTaskAction(
            file.name,
            base64String,
            file.type
          )

          if (res.success && res.data) {
            editor
              ?.chain()
              .focus()
              .insertContentAt(editor.state.selection.head, [
                { type: "image", attrs: { src: res.data } },
                { type: "paragraph" }
              ])
              .focus()
              .run()
            setLoading(false)
          }
        } catch {
          console.error("Failed to upload image")
        }
      }
      reader.readAsDataURL(file)
    }
    fileInput.click()
  }

  return (
    <div className="w-full  mx-auto border rounded-lg shadow-sm">
      {/* Toolbar */}
      <div className="border-b p-2 flex flex-wrap items-center gap-1">
        {/* Text Formatting */}
        <Button
          type="button"
          variant={editor.isActive("bold") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("italic") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("underline") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("strike") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("code") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Headings */}
        <Button
          type="button"
          variant={
            editor.isActive("heading", { level: 1 }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={
            editor.isActive("heading", { level: 2 }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={
            editor.isActive("heading", { level: 3 }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists */}
        <Button
          type="button"
          variant={editor.isActive("bulletList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("orderedList") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive("blockquote") ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Alignment */}
        <Button
          type="button"
          variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={
            editor.isActive({ textAlign: "center" }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={
            editor.isActive({ textAlign: "right" }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={
            editor.isActive({ textAlign: "justify" }) ? "default" : "ghost"
          }
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        {image_uploading ? (
          <>
            <Separator orientation="vertical" className="h-6" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                handleUploadImage()
              }}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </>
        ) : null}

        <Separator orientation="vertical" className="h-6" />

        {/* Link */}
        <Button
          type="button"
          variant={editor.isActive("link") ? "default" : "ghost"}
          size="sm"
          onClick={() => setShowLinkInput(!showLinkInput)}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Link Input */}
      {showLinkInput && (
        <div className="border-b p-3 flex items-center gap-2">
          <input
            type="url"
            placeholder="Enter URL..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="flex-1 px-3 py-1 border rounded text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addLink()
              }
            }}
          />
          <Button type="button" size="sm" onClick={addLink}>
            Add Link
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={removeLink}
          >
            Remove Link
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowLinkInput(false)}
          >
            Cancel
          </Button>
        </div>
      )}

      {/* Editor Content */}

      <div className="relative rich-editor">
        <div
          className="tiptap-editor-wrapper"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <EditorContent editor={editor} className="min-h-[200px]" />
        </div>
        {loading ? (
          <div className="absolute inset-0 bg-transparent backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 text-center">
            <Loader size={LoaderSizes.md} />
          </div>
        ) : null}
      </div>

      {/* Footer */}
      <div className="border-t p-2 text-xs text-gray-500 flex justify-between">
        <span>Rich Text Editor powered by Tiptap</span>
        <span>
          {editor.storage.characterCount.characters()} / {limit} characters
        </span>
      </div>
    </div>
  )
}
