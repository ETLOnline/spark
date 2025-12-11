import { CardContent, CardFooter } from "../../ui/card"
import PostInteractions from "./post-interactions"
import { Separator } from "@/src/components/ui/separator"
import PostComments from "./post-comments"
import PostCommentForm from "./post-comment-form"
import { SelectComment, SelectPost } from "@/src/db/schema"
import { Badge } from "../../ui/badge"
import PostCommentsSection from "./post-comments-section"
import { usePostNavigation } from "@/src/hooks/usePostNavigation"
import { useEffect, useRef, useState } from "react"
import { Button } from "../../ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useExpandableText } from "@/src/hooks/useExpandableText"

type Props = {
  post: SelectPost
  spaceId?: string
}

const TextPost: React.FC<Props> = ({ post, spaceId }) => {
  const { navigateToPost } = usePostNavigation()

  const content = post.content ?? ""
  const { contentRef, expanded, showToggle, toggle } = useExpandableText(
    6,
    content
  )

  const handleContentClick = () => {
    navigateToPost(post.id, spaceId)
  }

  return (
    <>
      <CardContent
        className={spaceId !== "shared" ? "cursor-pointer" : ""}
        onClick={spaceId !== "shared" ? handleContentClick : undefined}
      >
        <p
          ref={contentRef}
          className={`text-justify break-words whitespace-pre-wrap ${expanded ? "" : "line-clamp-6"}`}
        >
          {content}
        </p>

        {showToggle && (
          <Button
            onClick={toggle}
            variant="ghost"
            size="lg"
            className="mt-2 font-medium rounded-full mx-auto flex items-center gap-1"
          >
            {expanded ? "Show Less" : "Read More"}
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {post.hashtags &&
            post.hashtags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                #{tag.name}
              </Badge>
            ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        <PostInteractions
          postId={post.id}
          likes={post.likes}
          comments={post.comments}
          likers={post.postLikes}
          spaceId={spaceId}
        />
        <Separator />
        <PostCommentsSection comments={post.postComments || []} />
        <PostCommentForm
          postId={post.id}
          comments={post.comments}
          spaceId={spaceId}
        />
      </CardFooter>
    </>
  )
}

export default TextPost
