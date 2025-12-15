"use client"

import { useState } from "react"
import { SelectComment } from "@/src/db/schema"
import PostComments from "./post-comments"
import { Button } from "@/src/components/ui/button"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { ChevronDown, ChevronUp } from "lucide-react"

interface PostCommentsSectionProps {
  comments: SelectComment[]
}

const PostCommentsSection: React.FC<PostCommentsSectionProps> = ({
  comments
}) => {
  const [showAll, setShowAll] = useState(false)
  const displayedComments = showAll ? comments : comments.slice(0, 3)
  const hasMoreComments = comments.length > 3

  if (comments.length === 0) {
    return null // Don't show anything if no comments
  }

  return (
    <div className="w-full">
      {showAll ? (
        <ScrollArea className="h-[400px] w-full pr-3">
          <div className="space-y-4">
            {displayedComments.map((comment) => (
              <PostComments key={comment.id} comment={comment} />
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="space-y-4">
          {displayedComments.map((comment) => (
            <PostComments key={comment.id} comment={comment} />
          ))}
        </div>
      )}

      {hasMoreComments && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="text-muted-foreground hover:text-foreground mt-3 w-full"
        >
          {showAll ? (
            <>
              <ChevronUp className="mr-1 h-4 w-4" />
              Show less comments
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 h-4 w-4" />
              Load more comments ({comments.length - 3})
            </>
          )}
        </Button>
      )}
    </div>
  )
}

export default PostCommentsSection
