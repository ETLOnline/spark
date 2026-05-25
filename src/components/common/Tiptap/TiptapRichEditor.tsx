"use client"

import { useEditor, EditorContent, ReactRenderer } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import tippy from "tippy.js"
import Mention from "@tiptap/extension-mention"
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
  AlignJustify,
  AtSign
} from "lucide-react"
import {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef
} from "react"
import "./RichEditorFormat.css"
import Image from "@tiptap/extension-image"
import { Image as ImageIcon } from "lucide-react"
import { SelectUser } from "@/src/db/schema"
import { AddImageToStorageAction } from "@/src/server-actions/storage/storage"
import { createSchemaExtensions } from "./tiptapSchemaExtensions"
import Loader from "../Loader/Loader"
import { LoaderSizes } from "../types/loader-types"
import HardBreak from "@tiptap/extension-hard-break"
import Placeholder from "@tiptap/extension-placeholder"
import Blockquote from "@tiptap/extension-blockquote"
import ImageLightbox from "../LightBox"
import MentionList, {
  MentionListHandle
} from "../../Dashboard/Chat/components/MentionList"

const CustomBlockquote = Blockquote.extend({
  addKeyboardShortcuts() {
    return {
      Enter: ({ editor }) => {
        const { $from } = editor.state.selection

        const isInBlockquote = $from.node(-1)?.type?.name === "blockquote"

        const isEmpty = $from.parent.textContent.length === 0

        // Exit blockquote on empty line
        if (isInBlockquote && isEmpty) {
          return editor.chain().focus().lift("blockquote").run()
        }

        return false
      },

      Backspace: ({ editor }) => {
        const { $from } = editor.state.selection

        const isInBlockquote = $from.node(-1)?.type?.name === "blockquote"

        const isAtStart = $from.parentOffset === 0
        const isEmpty = $from.parent.textContent.length === 0

        // Exit blockquote cleanly instead of deleting it
        if (isInBlockquote && isAtStart && isEmpty) {
          return editor.chain().focus().lift("blockquote").run()
        }

        return false
      }
    }
  }
})

interface RichTextEditorProps {
  value?: string
  onChange?: (content: string) => void
  image_uploading?: boolean
  entity?: string
  editable?: boolean
  limit?: number
  mentionUsers?: SelectUser[]
  showMentions?: boolean
  minHeight?: string
  showToolbar?: boolean
  onEnterPress?: () => void
  onMentionStateChange?: (isActive: boolean) => void
  showFooter?: boolean
  maxHeight?: string
  isScrollAble?: boolean
  placeholder?: string
}

export default function RichTextEditor({
  value,
  onChange,
  image_uploading,
  entity,
  editable,
  limit = 1000,
  mentionUsers = [],
  showMentions = false,
  minHeight = "200px",
  maxHeight,
  isScrollAble = false,
  showToolbar = true,
  onEnterPress,
  onMentionStateChange,
  showFooter = true,
  placeholder
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState("")
  const [isEditingLink, setIsEditingLink] = useState(false)
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const editorRef = useRef<any>(null)
  const mentionActiveRef = useRef(false)

  const editorKey = useMemo(
    () => `${showMentions}-${mentionUsers.length}`,
    [showMentions, mentionUsers.length]
  )

  const CustomImage = Image.extend({
    addNodeView() {
      return ({ node, getPos, editor }) => {
        // Create wrapper
        const dom = document.createElement("div")
        dom.className =
          "tiptap-image-wrapper relative inline-block hover:cursor-pointer group max-w-full overflow-hidden align-middle max-w-xs"

        // Create image
        const img = document.createElement("img")
        img.src = node.attrs.src
        img.className =
          "rounded-md max-w-full h-auto object-contain transition-all duration-200 ease-in-out"
        img.onload = () => {
          img.style.opacity = "1"
        }

        dom.appendChild(img)
        img.onclick = (e) => {
          e.stopPropagation()

          // Extract all images from the editor content
          const allImages: string[] = []
          let currentImageIndex = 0

          editor.state.doc.descendants((node: any) => {
            if (node.type.name === "image") {
              if (node.attrs.src === img.src) {
                currentImageIndex = allImages.length
              }
              allImages.push(node.attrs.src)
            }
          })

          setLightboxImages(allImages)
          setLightboxIndex(currentImageIndex)
          setLightboxOpen(true)
        }

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

  const isContentEmpty = (html: string) => {
    if (!html) return true

    // 1️⃣ If an image exists → NOT empty
    if (/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi.test(html)) {
      return false
    }
    // 2️⃣ Remove tags and check text
    const text = html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "")
      .trim()

    return text === ""
  }
  const applyPopupStyles = (popup: any) => {
    if (popup?.[0]?.popper) {
      popup[0].popper.style.zIndex = "99999"
      popup[0].popper.style.pointerEvents = "auto"
    }
  }
  const schemaExtensions = useMemo(
    () =>
      createSchemaExtensions({
        limit,
        placeholder,
        clickableLinks: false
      }),
    [limit, placeholder, showMentions, mentionUsers.length]
  )

  const extensions = useMemo(() => {
    const editorOnlyExtensions: any[] = []

    // Custom Image NodeView (UI only)
    editorOnlyExtensions.push(CustomImage)

    // Mention UI logic
    if (showMentions && mentionUsers.length > 0) {
      editorOnlyExtensions.push(
        Mention.configure({
          HTMLAttributes: {
            class:
              "mention bg-primary/10 text-primary px-1 py-0.5 rounded font-medium"
          },
          suggestion: {
            items: ({ query, editor }: { query: string; editor: any }) => {
              if (!mentionUsers || mentionUsers.length === 0) {
                console.warn("No mention users available")
                return []
              }

              const mentionedUserIds = new Set<string>()

              try {
                if (editor && editor.state && editor.state.doc) {
                  editor.state.doc.descendants((node: any) => {
                    if (node.type.name === "mention" && node.attrs.id) {
                      mentionedUserIds.add(node.attrs.id)
                    }
                  })
                }
              } catch (error) {
                console.warn("Could not check for existing mentions:", error)
              }

              const filtered = mentionUsers
                .filter((user) => {
                  if (mentionedUserIds.has(user.unique_id)) {
                    return false
                  }
                  const fullName =
                    `${user.first_name} ${user.last_name}`.toLowerCase()
                  return (
                    fullName.includes(query.toLowerCase()) ||
                    user.email?.toLowerCase().includes(query.toLowerCase())
                  )
                })
                .slice(0, 5)

              return filtered
            },
            render: () => {
              let component: ReactRenderer
              let popup: any

              return {
                onStart: (props: any) => {
                  mentionActiveRef.current = true
                  onMentionStateChange?.(true)

                  component = new ReactRenderer(MentionList, {
                    props,
                    editor: props.editor
                  })

                  if (!props.clientRect) {
                    return
                  }

                  popup = tippy("body", {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: "manual",
                    placement: "top-start"
                  })

                  applyPopupStyles(popup)
                },

                onUpdate(props: any) {
                  component.updateProps(props)

                  if (!props.clientRect) {
                    return
                  }

                  popup[0].setProps({
                    getReferenceClientRect: props.clientRect
                  })
                  applyPopupStyles(popup)
                },

                onKeyDown(props: any) {
                  if (props.event.key === "Escape") {
                    popup[0].hide()
                    mentionActiveRef.current = false
                    onMentionStateChange?.(false)
                    return true
                  }

                  return (
                    (component.ref as MentionListHandle | null)?.onKeyDown?.(
                      props
                    ) || false
                  )
                },

                onExit() {
                  mentionActiveRef.current = false
                  onMentionStateChange?.(false)
                  popup[0].destroy()
                  component.destroy()
                }
              }
            }
          }
        })
      )
    }

    return [...schemaExtensions, ...editorOnlyExtensions]
  }, [schemaExtensions, showMentions, mentionUsers.length])

  const editor = useEditor({
    extensions,
    content: value || "",
    editable,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none p-1"
      },
      handleKeyDown: (view, event) => {
        if (
          event.key === "Enter" &&
          !event.shiftKey &&
          !mentionActiveRef.current &&
          !showToolbar
        ) {
          event.preventDefault()
          onEnterPress?.()
          return true
        }
        return false
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
                const res = await AddImageToStorageAction(
                  file.name,
                  base64String,
                  file.type,
                  entity || "general"
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
        onChange(isContentEmpty(html) ? "" : html)
      }
    }
  })

  const updateLinkInputFromSelection = () => {
    if (!editor) return

    const attrs = editor.getAttributes("link")
    if (attrs?.href) {
      setLinkUrl(attrs.href)
      setShowLinkInput(true)
    }
  }

  useEffect(() => {
    if (!editor) return

    const onSelectionUpdate = () => {
      const isLinkActive = editor.isActive("link")

      if (isLinkActive) {
        const attrs = editor.getAttributes("link")
        setLinkUrl(attrs?.href ?? "")
        setShowLinkInput(true)
        setIsEditingLink(true)
      } else {
        setLinkUrl("")
        setShowLinkInput(false)
        setIsEditingLink(false)
      }
    }

    editor.on("selectionUpdate", onSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", onSelectionUpdate)
    }
  }, [editor])

  useEffect(() => {
    if (editor) {
      editorRef.current = editor
      if (value !== undefined && value !== editor.getHTML()) {
        editor.commands.setContent(value, false)
      }
    }
  }, [value, editor])

  useEffect(() => {
    if (editor) {
      const currentExtensions = editor.extensionManager.extensions.map(
        (ext) => ext.name
      )
      const hasMention = currentExtensions.includes("mention")
      const shouldHaveMention = showMentions && mentionUsers.length > 0
      if (hasMention !== shouldHaveMention) {
        editor.destroy()
        return () => {}
      }
    }
  }, [editor, showMentions, mentionUsers.length])

  if (!editor) {
    return null
  }
  const addLink = () => {
    if (!linkUrl) return

    let url = linkUrl.trim()

    // ✅ If the user didn’t add protocol, default to https
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()

    setLinkUrl("")
    setShowLinkInput(false)
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
          const res = await AddImageToStorageAction(
            file.name,
            base64String,
            file.type,
            entity || "general"
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
    <div className="w-full mx-auto border rounded-lg shadow-sm">
      {showToolbar && (
        <>
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
              variant={
                editor.isActive({ textAlign: "left" }) ? "default" : "ghost"
              }
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
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
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
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
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
              onClick={() => {
                if (editor.isActive("link")) {
                  const attrs = editor.getAttributes("link")
                  setLinkUrl(attrs?.href ?? "")
                  setShowLinkInput(true)
                } else {
                  setLinkUrl("")
                  setShowLinkInput(true)
                }
              }}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>

            {showMentions && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    editor.chain().focus().insertContent("@").run()
                  }}
                  title="Mention someone"
                >
                  <AtSign className="h-4 w-4" />
                </Button>
              </>
            )}

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
                {isEditingLink ? "Update Link" : "Add Link"}
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
        </>
      )}

      {/* Editor Content */}
      <div
        className="relative rich-editor"
        key={`editor-wrapper-${showMentions}-${mentionUsers.length}`}
      >
        <div
          className="tiptap-editor-wrapper p-1"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <EditorContent
            editor={editor}
            style={{
              minHeight: minHeight,
              maxHeight: isScrollAble ? (maxHeight ?? "250px") : "",
              overflowY: isScrollAble ? "auto" : "visible"
            }}
          />
        </div>
        {loading ? (
          <div className="absolute inset-0 bg-transparent backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 text-center">
            <Loader size={LoaderSizes.md} />
          </div>
        ) : null}
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="border-t p-2 text-xs text-gray-500 flex justify-between">
          <span>
            {editor.storage.characterCount.characters()} / {limit} characters
          </span>
        </div>
      )}
      <ImageLightbox
        open={lightboxOpen}
        images={lightboxImages}
        index={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  )
}
