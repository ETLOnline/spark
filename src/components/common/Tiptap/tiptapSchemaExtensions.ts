// src/tiptap/tiptapSchemaExtensions.ts
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Heading from "@tiptap/extension-heading"
import CharacterCount from "@tiptap/extension-character-count"
import Image from "@tiptap/extension-image"
import HardBreak from "@tiptap/extension-hard-break"
import Placeholder from "@tiptap/extension-placeholder"

export interface SchemaExtensionOptions {
  limit?: number
  placeholder?: string
  clickableLinks?: boolean
}

export const createSchemaExtensions = (
  options: SchemaExtensionOptions = {}
) => {
  const { limit = 1000, placeholder = "", clickableLinks = false } = options

  const extensions: any[] = [
    StarterKit.configure({
      hardBreak: false
    }),

    Placeholder.configure({
      placeholder
    }),

    Underline,

    Link.configure({
      openOnClick: clickableLinks
    }),

    TextAlign.configure({
      types: ["heading", "paragraph"]
    }),

    Heading.configure({
      levels: [1, 2, 3]
    }),

    CharacterCount.configure({
      limit
    }),

    Image.configure({
      inline: false,
      allowBase64: true
    }),

    HardBreak
  ]

  return extensions
}
