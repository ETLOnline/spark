import React, { Dispatch, SetStateAction } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import { ChevronDown, Edit, Trash2 } from "lucide-react"
import { SelectMessage } from "@/src/db/schema"

interface MessageBubbleMenuProps {
  message: SelectMessage
  setEditingMessage: Dispatch<SetStateAction<SelectMessage | null>>
  setRichMessageContent: Dispatch<SetStateAction<string>>
  handleDelteMsg: (msg: SelectMessage) => void
}

function MessageBubbleMenu({
  message,
  setEditingMessage,
  setRichMessageContent,
  handleDelteMsg
}: MessageBubbleMenuProps) {
  const convertMentionsToHtml = (text: string) => {
    return text.replace(/@\[\s*(.*?)\s*\]\((.*?)\)/g, (_, label, id) => {
      return `<span data-type="mention" data-id="${id}" data-label="${label}">@${label}</span>`
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <ChevronDown className="h-4 w-4 absolute top-2 right-2 cursor-pointer rounded opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {message.type === "text" && (
          <DropdownMenuItem
            onClick={() => {
              setEditingMessage(message)
              const formatted = convertMentionsToHtml(message.message)
              setRichMessageContent(formatted)
            }}
          >
            <Edit className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => handleDelteMsg(message)}
          className="text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default MessageBubbleMenu
