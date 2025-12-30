import { parseMentions } from "@/src/services/realtime/utils/helper"

interface MessageContentProps {
  content: string
}

export const MessageContent = ({ content }: MessageContentProps) => {
  const renderMessageWithMentions = (text: string) => {
    const tokens = parseMentions(text)
    return tokens.map((t, i) => {
      if (t.type === "mention") {
        return (
          <span
            key={i}
            className="inline-flex items-center px-1.5 py-0.5 rounded font-medium bg-teal-600 text-white"
          >
            @{t.value}
          </span>
        )
      }
      return <span key={i} dangerouslySetInnerHTML={{ __html: t.value }} />
    })
  }

  return (
    <p className="text-sm whitespace-pre-wrap break-words break-all">
      {renderMessageWithMentions(content)}
    </p>
  )
}
