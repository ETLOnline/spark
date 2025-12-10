import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { SelectComment } from "@/src/db/schema"
import { formatRelativeTime } from "@/src/utils/helpers"
import { Button } from "../../ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"

type Props = {
  comment: SelectComment
}

const PostComments: React.FC<Props> = ({ comment }) => {
  const name = `${comment.commentor.first_name} ${comment.commentor.last_name}`
  const [expanded, setExpanded] = useState(false)
  const [showToggle, setShowToggle] = useState(false)
  const contentRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      const el = contentRef.current

      const prevClamp = el.style.webkitLineClamp
      el.style.webkitLineClamp = "unset"

      const fullHeight = el.scrollHeight

      el.style.webkitLineClamp = prevClamp

      const lineHeight = parseFloat(getComputedStyle(el).lineHeight)
      const maxHeight = lineHeight * 3

      if (fullHeight > maxHeight) {
        setShowToggle(true)
      }
    }
  }, [comment.content])

  return (
    <div className="rounded-[15px] bg-card flex flex-col w-full gap-2">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={comment.commentor.profile_url as string}
            alt={name}
          />
          <AvatarFallback>{name}</AvatarFallback>
        </Avatar>

        <div>
          <p className="font-bold text-sm">{name}</p>
          <p className="text-xs text-muted-foreground/75">
            {formatRelativeTime(comment.created_at || "")}
          </p>
        </div>
      </div>

      <p
        ref={contentRef}
        className={`text-sm pl-5 pr-1 text-justify break-words whitespace-pre-wrap ${expanded ? "" : "line-clamp-3"}`}
      >
        {comment.content}
      </p>
      {showToggle && (
        <div className="flex justify-center my-1">
          <Button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="font-medium rounded-full flex items-center gap-1"
            variant="ghost"
            size="sm"
          >
            {expanded ? "Show Less" : "Read More"}
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default PostComments
