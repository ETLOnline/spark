"use client"
import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import Tiptap from "@/src/components/common/TiptapRichEditor"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateTaskCommentAction,
  GetTaskCommentsAction
} from "@/src/server-actions/Tasks/Task"
import { useToast } from "@/src/hooks/use-toast"
import { SelectTaskComment, SelectUser } from "@/src/db/schema"
import { Card, CardContent } from "@/src/components/ui/card"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"

interface TaskCommentFormProps {
  taskId: string
}
const COMMENTS_PER_LOAD = 4

export function TaskComment({ taskId }: TaskCommentFormProps) {
  const authUser = useAtomValue(userStore.AuthUser)
  const userId = authUser?.unique_id
  const { toast } = useToast()
  const [commentContent, setCommentContent] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [comments, setComments] = useState<SelectTaskComment[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMoreComments, setHasMoreComments] = useState(true)

  const [
    creatingComment,
    createCommentRes,
    createCommentErr,
    triggerCreateComment
  ] = useServerAction(CreateTaskCommentAction)

  const [loadingComments, getCommentsRes, getCommentsErr, triggerGetComments] =
    useServerAction(GetTaskCommentsAction)

  useEffect(() => {
    if (taskId) {
      triggerGetComments({ taskId, limit: COMMENTS_PER_LOAD, offset })
    }
  }, [taskId, offset])

  useEffect(() => {
    if (createCommentRes?.success && createCommentRes?.data) {
      setCommentContent("")
      setIsEditing(false)
      toast({
        title: "Comment added successfully",
        duration: 3000
      })

      const newCommentWithUser = {
        ...createCommentRes.data,
        user: authUser as SelectUser
      }
      setComments((prevComments) => [newCommentWithUser, ...prevComments])
    }
  }, [createCommentRes, authUser])

  useEffect(() => {
    if (getCommentsRes?.success && getCommentsRes?.data) {
      setComments((prevComments) => [...prevComments, ...getCommentsRes.data])

      if (getCommentsRes.data.length < COMMENTS_PER_LOAD) {
        setHasMoreComments(false)
      } else {
        setHasMoreComments(true)
      }
    }
  }, [getCommentsRes])

  const handleAddComment = () => {
    if (commentContent.trim()) {
      triggerCreateComment({
        task_id: taskId,
        user_id: userId,
        content: commentContent
      })
    }
  }

  const handleCancel = () => {
    setCommentContent("")
    setIsEditing(false)
  }

  const handleLoadMore = () => {
    setOffset((prevOffset) => prevOffset + COMMENTS_PER_LOAD)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) {
      return "Today"
    } else if (diffInDays === 1) {
      return "1 day ago"
    } else {
      return `${diffInDays} days ago`
    }
  }

  return (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          {isEditing ? (
            <div className="space-y-3">
              <Tiptap value={commentContent} onChange={setCommentContent} />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={creatingComment}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAddComment}
                  disabled={!commentContent.trim() || creatingComment}
                  loading={creatingComment}
                >
                  {creatingComment ? "Adding..." : "Comment"}
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="min-h-[80px] border border-input rounded-md p-3 cursor-pointer hover:bg-card transition-colors flex items-center text-muted-foreground"
              onClick={() => setIsEditing(true)}
            >
              Write your comment here...
            </div>
          )}
        </div>
      </div>

      {/* LISTING THE COMMENTS */}
      <div className="grid gap-4 mt-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Card
              key={`${comment.id}-${comment.created_at}`}
              className="bg-card border-gray-700 text-gray-50"
            >
              <CardContent className="p-4 flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={comment?.user?.profile_url || "/placeholder-user.jpg"}
                  />
                  <AvatarFallback>
                    {comment?.user?.first_name[0]}
                    {comment?.user?.last_name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="grid gap-1 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-gray-100">
                      {comment?.user?.first_name} {comment?.user?.last_name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {comment?.created_at
                        ? formatTimeAgo(comment?.created_at)
                        : ""}
                    </div>
                  </div>
                  <div
                    className="text-sm text-gray-300"
                    dangerouslySetInnerHTML={{ __html: comment.content }}
                  />
                </div>
              </CardContent>
            </Card>
          ))
        ) : loadingComments ? (
          <div className="text-center py-4 text-muted-foreground">
            Loading comments...
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            No comments yet. Be the first to add one!
          </div>
        )}
        {hasMoreComments && !loadingComments && (
          <div className="flex justify-center mt-4">
            <Button
              onClick={handleLoadMore}
              disabled={loadingComments}
              loading={loadingComments}
              variant="outline"
            >
              {loadingComments ? "Loading more..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
      {/* LISTING COMMENT END HERE */}
    </>
  )
}
