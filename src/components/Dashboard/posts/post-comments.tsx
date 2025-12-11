import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { SelectComment } from "@/src/db/schema"
import { formatRelativeTime } from "@/src/utils/helpers"
import { Button } from "../../ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useExpandableText } from "@/src/hooks/useExpandableText"

type Props = {
  comment: SelectComment
}

const PostComments: React.FC<Props> = ({ comment }) => {
  const name = `${comment.commentor.first_name} ${comment.commentor.last_name}`

  const { contentRef, expanded, showToggle, toggle } = useExpandableText(
    3,
    comment.content
  )

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
            onClick={toggle}
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
