import { SelectUser } from "@/src/db/schema"

interface MessageContentProps {
  content: string
  currentUserId?: string
  users?: SelectUser[]
}

export const MessageContent = ({
  content,
  currentUserId,
  users
}: MessageContentProps) => {
  const renderMessageWithMentions = (text: string) => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match
    let key = 0

    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${key++}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        )
      }

      const displayName = match[1]
      const userId = match[2]
      const isCurrentUser = userId === currentUserId

      parts.push(
        <span
          key={`mention-${key++}`}
          className="
          inline-flex items-center px-1.5 py-0.5 rounded font-medium bg-teal-600 text-white  "
        >
          @{displayName}
        </span>
      )

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${key++}`}>{text.substring(lastIndex)}</span>
      )
    }

    return parts.length > 0 ? parts : text
  }

  return (
    <p className="text-sm whitespace-pre-wrap break-words">
      {renderMessageWithMentions(content)}
    </p>
  )
}

export const MessageContentWithAvatars = ({
  content,
  currentUserId,
  users
}: MessageContentProps) => {
  const getUserById = (userId: string) => {
    return users?.find((u) => u.unique_id === userId)
  }

  const renderMessageWithMentions = (text: string) => {
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let match
    let key = 0

    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${key++}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        )
      }

      const displayName = match[1]
      const userId = match[2]
      const user = getUserById(userId)
      const isCurrentUser = userId === currentUserId

      parts.push(
        <span
          key={`mention-${key++}`}
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium ${
            isCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-primary/10 text-primary"
          }`}
          title={user?.email}
        >
          {user?.profile_url && (
            <img
              src={user.profile_url}
              alt={displayName}
              className="w-4 h-4 rounded-full"
            />
          )}
          @{displayName}
        </span>
      )

      lastIndex = match.index + match[0].length
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${key++}`}>{text.substring(lastIndex)}</span>
      )
    }

    return parts.length > 0 ? parts : text
  }

  return (
    <p className="text-sm whitespace-pre-wrap break-words">
      {renderMessageWithMentions(content)}
    </p>
  )
}