"use client"
import { useState, useEffect, Dispatch, SetStateAction } from "react"
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
import { formatRelativeTime } from "@/src/utils/helpers"

interface TaskCommentFormProps {
  taskId: string
  isSprintCompleted?: boolean
  refetchComments?: boolean
  setRefetchComments?: Dispatch<SetStateAction<boolean>>
}
const COMMENTS_PER_LOAD = 4

export function TaskComment({
  taskId,
  isSprintCompleted,
  refetchComments,
  setRefetchComments
}: TaskCommentFormProps) {
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

  const GetComments = () => {
    triggerGetComments({
      taskId,
      limit: COMMENTS_PER_LOAD,
      offset
    })
  }

  useEffect(() => {
    GetComments()
  }, [taskId, offset])

  useEffect(() => {
    if (refetchComments) {
      GetComments()
      setRefetchComments?.(false)
    }
  }, [refetchComments])

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
      setComments((prevComments) =>
        prevComments.some((c) => c.id === newCommentWithUser.id)
          ? prevComments
          : [...prevComments, newCommentWithUser]
      )
    }
  }, [createCommentRes, authUser])

  useEffect(() => {
    if (getCommentsRes?.success && getCommentsRes?.data) {
      setComments(getCommentsRes.data)

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

  return (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          {isEditing ? (
            <div className="space-y-3">
              <Tiptap
                value={commentContent}
                onChange={setCommentContent}
                editable={!isSprintCompleted}
              />
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
                  disabled={
                    !commentContent.trim() ||
                    creatingComment ||
                    isSprintCompleted
                  }
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
              className="bg-card text-foreground border border-border"
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
                    <div className="font-semibold">
                      {comment?.user?.first_name} {comment?.user?.last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {comment?.created_at
                        ? formatRelativeTime(comment?.created_at)
                        : ""}
                    </div>
                  </div>
                  {comment.type === "history" ? (
                    <div className="text-sm space-y-3">
                      {Array.isArray(comment.task_history)
                        ? comment.task_history.map((item: any, i: number) => (
                            <div
                              key={i}
                              className="border-l-2 border-muted pl-3"
                            >
                              <div className="font-semibold text-foreground">
                                {item.key}:
                              </div>

                              <div className="text-muted-foreground flex items-center gap-2 mt-0.5">
                                <span className="line-through opacity-70">
                                  {item.old === " " ? "N/A" : item.old}
                                </span>
                                <span>→</span>
                                <span className="s text-foreground">
                                  {item.new}
                                </span>
                              </div>
                            </div>
                          ))
                        : null}
                    </div>
                  ) : (
                    <div
                      className="text-sm rich-editor"
                      dangerouslySetInnerHTML={{ __html: comment.content }}
                    />
                  )}
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
