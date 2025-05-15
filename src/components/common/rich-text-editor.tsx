"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/src/components/ui/tooltip"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  ImageIcon,
  Code,
  Underline,
  Heading1,
  Heading2,
} from "lucide-react"
import { Textarea } from "../ui/textarea"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
}

export default function RichTextEditor({ value, onChange, onBlur }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [isActive, setIsActive] = useState("")

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const execCommand = (command: string, value = "") => {
    document.execCommand(command, false, value)
    handleInput()
    focusEditor()
  }

  const formatText = (format: string, value?: string) => {
    execCommand(format, value || "")

    // Special handling for lists to place cursor properly
    if (format === "insertUnorderedList" || format === "insertOrderedList") {
      setTimeout(() => {
        const selection = window.getSelection()
        if (selection && editorRef.current) {
          // Find the last list item
          const listItems = editorRef.current.querySelectorAll('li')
          if (listItems.length > 0) {
            const lastItem = listItems[listItems.length - 1]
            const range = document.createRange()
            range.setStartAfter(lastItem)
            range.collapse(true)
            selection.removeAllRanges()
            selection.addRange(range)
          }
        }
      }, 0)
    }
  }

  const insertLink = () => {
    const url = prompt("Enter URL:")
    if (url) {
      execCommand("createLink", url)

      // Move cursor after the link
      setTimeout(() => {
        const selection = window.getSelection()
        if (selection && editorRef.current) {
          const links = editorRef.current.getElementsByTagName('a')
          if (links.length > 0) {
            const lastLink = links[links.length - 1]
            const range = document.createRange()
            range.setStartAfter(lastLink)
            range.collapse(true)
            selection.removeAllRanges()
            selection.addRange(range)
          }
        }
      }, 0)
    }
  }

  const insertImage = () => {
    const url = prompt("Enter image URL:")
    if (url) {
      execCommand("insertImage", url)
    }
  }

  const focusEditor = () => {
    if (editorRef.current) {
      editorRef.current.focus()

      // If there's no selection, place cursor at the end
      const selection = window.getSelection()
      if (selection && selection.rangeCount === 0 && editorRef.current) {
        const range = document.createRange()
        range.selectNodeContents(editorRef.current)
        range.collapse(false)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      execCommand("insertImage", imageUrl);
    }
  };

  return (
    <div className={`border rounded-md ${isFocused ? "ring-1 ring-ring " : ""}`}>
      <TooltipProvider>
        <div className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/50">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isActive === "bold" ? "bg-accent" : ""}`}
                onClick={(e) => {
                  formatText("bold")
                  setIsActive(isActive === "bold" ? "" : "bold")
                }}
              >
                <Bold className="h-4 w-4" />
                <span className="sr-only">Bold</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isActive === "italic" ? "bg-accent" : ""}`}
                onClick={() => {
                  formatText("italic")
                  setIsActive(isActive === "italic" ? "" : "italic")
                }
                }
              >
                <Italic className="h-4 w-4" />
                <span className="sr-only">Italic</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isActive === "underline" ? "bg-accent" : ""}`}
                onClick={() => {
                  formatText("underline")
                  setIsActive(isActive === "underline" ? "" : "underline")
                }
                }
              >
                <Underline className="h-4 w-4" />
                <span className="sr-only">Underline</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isActive === "<h1>" ? "bg-accent" : ""}`}
                onClick={() => {
                  formatText("formatBlock", "<h1>")
                  setIsActive(isActive === "<h1>" ? "" : "<h1>")
                }
                }
              >
                <Heading1 className="h-4 w-4" />
                <span className="sr-only">Heading 1</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 1</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isActive === "<h2>" ? "bg-accent" : ""}`}
                onClick={() => {
                  formatText("formatBlock", "<h2>")
                  setIsActive(isActive === "<h2>" ? "" : "<h2>")
                }}
              >
                <Heading2 className="h-4 w-4" />
                <span className="sr-only">Heading 2</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Heading 2</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isActive === "insertUnorderedList" ? "bg-accent" : ""}`}
                onClick={() => {
                  formatText("insertUnorderedList")
                  setIsActive(isActive === "insertUnorderedList" ? "" : "insertUnorderedList")
                }}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">Bullet List</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bullet List</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isActive === "insertOrderedList" ? "bg-accent" : ""}`}
                onClick={() => {
                  formatText("insertOrderedList")
                  setIsActive(isActive === "insertOrderedList" ? "" : "insertOrderedList")
                }}
              >
                <ListOrdered className="h-4 w-4" />
                <span className="sr-only">Numbered List</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Numbered List</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isActive === "justifyLeft" ? "bg-accent" : ""}`}
                onClick={() => {
                  formatText("justifyLeft")
                  setIsActive(isActive === "justifyLeft" ? "" : "justifyLeft")
                }}
              >
                <AlignLeft className="h-4 w-4" />
                <span className="sr-only">Align Left</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Left</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isActive === "justifyCenter" ? "bg-accent" : ""}`}
                onClick={() => {
                  formatText("justifyCenter")
                  setIsActive(isActive === "justifyCenter" ? "" : "justifyCenter")
                }}
              >
                <AlignCenter className="h-4 w-4" />
                <span className="sr-only">Align Center</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Center</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isActive === "justifyRight" ? "bg-accent" : ""}`}
                onClick={() => {
                  formatText("justifyRight")
                  setIsActive(isActive === "justifyRight" ? "" : "justifyRight")
                }}
              >
                <AlignRight className="h-4 w-4" />
                <span className="sr-only">Align Right</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Right</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border mx-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={insertLink}>
                <Link className="h-4 w-4" />
                <span className="sr-only">Insert Link</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Insert Link</TooltipContent>
          </Tooltip>

          {/* <Tooltip>
      <TooltipTrigger asChild>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleButtonClick}
        >
          <ImageIcon className="h-4 w-4" />
          <span className="sr-only">Insert Image</span>
          <Input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </Button>

      </TooltipTrigger>
      <TooltipContent>Insert Image</TooltipContent>
    </Tooltip> */}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${isActive === "<pre>" ? "bg-accent" : ""}`}
                onClick={() => {
                  formatText("formatBlock", "<pre>")
                  setIsActive(isActive === "<pre>" ? "" : "<pre>")
                }}
              >
                <Code className="h-4 w-4" />
                <span className="sr-only">Code Block</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Code Block</TooltipContent>
          </Tooltip>

        </div>
      </TooltipProvider>


      <div
        ref={editorRef}
        className="min-h-[200px] p-3 focus:outline-none"
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}


      />
    </div>
  )
}

