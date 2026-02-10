"use client"
import { useState, useEffect, Dispatch, SetStateAction, use } from "react"
import { Button } from "@/src/components/ui/button"
import Tiptap from "@/src/components/common/Tiptap/TiptapRichEditor"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useToast } from "@/src/hooks/use-toast"
import { SelectTaskComment, SelectUser } from "@/src/db/schema"
import { Card, CardContent } from "@/src/components/ui/card"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { formatRelativeTime } from "@/src/utils/helpers"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import {
  CreateTaskCommentAction,
  DeleteTaskCommentAction,
  GetTaskCommentsAction,
  UpdateTaskCommentAction
} from "@/src/server-actions/Tasks/TaskComment"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/src/components/ui/alert-dialog"
import ImageLightbox from "@/src/components/common/LightBox"

interface TaskCommentFormProps {
  taskId: string
  isSprintCompleted?: boolean
  refetchComments?: boolean
  setRefetchComments?: Dispatch<SetStateAction<boolean>>
  projectUsers: SelectUser[]
}
const COMMENTS_PER_LOAD = 4

export function TaskComment({
  taskId,
  isSprintCompleted,
  refetchComments,
  setRefetchComments,
  projectUsers
}: TaskCommentFormProps) {
  const authUser = useAtomValue(userStore.AuthUser)
  const userId = authUser?.unique_id
  const { toast } = useToast()
  const [commentContent, setCommentContent] = useState("")
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [comments, setComments] = useState<SelectTaskComment[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMoreComments, setHasMoreComments] = useState(true)
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false)
  const [CommentToDelete, setCommentToDelete] = useState<number | null>(null)
  const [CommentToUpdate, setCommentToUpdate] = useState<number | null>(null)
  const [totalCount, setTotalCount] = useState(0)

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const [
    creatingComment,
    createCommentRes,
    createCommentErr,
    triggerCreateComment
  ] = useServerAction(CreateTaskCommentAction)

  const [loadingComments, getCommentsRes, getCommentsErr, triggerGetComments] =
    useServerAction(GetTaskCommentsAction)

  const [updateCommentLoading, , , UpdateComment] = useServerAction(
    UpdateTaskCommentAction
  )

  const [DeleteCommentLoading, , , DeleteComment] = useServerAction(
    DeleteTaskCommentAction
  )

  const GetComments = (reset = false) => {
    triggerGetComments({
      taskId,
      limit: COMMENTS_PER_LOAD,
      offset: reset ? 0 : offset
    })
  }

  useEffect(() => {
    GetComments()
  }, [taskId])

  useEffect(() => {
    if (offset > 0) GetComments()
  }, [offset])

  useEffect(() => {
    if (refetchComments) {
      setComments([])
      setOffset(0)
      setHasMoreComments(true)
      GetComments(true)
      setRefetchComments?.(false)
    }
  }, [refetchComments])

  useEffect(() => {
    if (createCommentRes?.success && createCommentRes?.data) {
      setCommentContent("")
      setIsAddingComment(false)
      toast({
        title: "Comment added successfully",
        duration: 3000
      })

      const newCommentWithUser = {
        ...createCommentRes.data,
        user: authUser as SelectUser
      }

      setComments((prev) => {
        if (prev.some((c) => c.id === newCommentWithUser.id)) return prev
        return [...prev, newCommentWithUser]
      })

      setTotalCount((prev) => prev + 1)
    }
  }, [createCommentRes, authUser])

  useEffect(() => {
    if (getCommentsRes?.success && getCommentsRes?.data) {
      const { comments: newComments, totalCount: serverTotal } =
        getCommentsRes.data

      setTotalCount(serverTotal)

      if (offset === 0) {
        setComments(newComments)
      } else {
        setComments((prev) => {
          const existingIds = new Set(prev.map((c) => c.id))
          const filtered = newComments.filter((c) => !existingIds.has(c.id))
          return [...prev, ...filtered]
        })
      }

      if (comments.length + newComments.length >= serverTotal) {
        setHasMoreComments(false)
      }
    }
  }, [getCommentsRes, offset])

  const handleSubmit = () => {
    if (isAddingComment) {
      handleAddComment()
    } else if (isEditing) {
      handleUpdateCommment()
    }
  }

  const handleAddComment = () => {
    if (commentContent.trim()) {
      triggerCreateComment({
        task_id: taskId,
        user_id: userId,
        content: commentContent
      })
    }
  }

  const handleLoadMore = () => {
    setOffset((prev) => prev + COMMENTS_PER_LOAD)
  }

  const availableUsers = projectUsers.filter(
    (user) => user.unique_id !== authUser?.unique_id
  )

  const handleDeleteComment = async (commentId: number | null) => {
    try {
      if (!commentId) return

      await DeleteComment(commentId)

      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      )

      toast({
        title: "Comment deleted successfully",
        duration: 3000
      })
    } catch {
      toast({
        title: "Error deleting comment",
        description: "An error occurred while trying to delete the comment.",
        duration: 3000,
        variant: "destructive"
      })
    }
  }

  const handleUpdateCommment = async () => {
    try {
      if (!commentContent.trim() || !CommentToUpdate) return

      const res = await UpdateComment(CommentToUpdate, commentContent)

      if (res?.success && res?.data) {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === CommentToUpdate
              ? (res.data as SelectTaskComment)
              : comment
          )
        )
        setIsEditing(false)
        toast({
          title: "Comment updated successfully",
          duration: 3000
        })
      }
    } catch {
      toast({
        title: "Error updating comment",
        description: "An error occurred while trying to update the comment.",
        duration: 3000,
        variant: "destructive"
      })
    }
  }

  const loading =
    creatingComment || updateCommentLoading || DeleteCommentLoading

  const handleCommentImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement

    // ✅ Only react to IMG clicks
    if (target.tagName !== "IMG") return

    // ⛔ Stop ONLY image click from bubbling
    e.preventDefault()
    e.stopPropagation()

    // 🛑 If lightbox already open, do nothing
    if (lightboxOpen) return

    const img = target as HTMLImageElement

    const commentContent = img.closest(".rich-editor")
    if (!commentContent) return

    const images = Array.from(commentContent.querySelectorAll("img")).map(
      (img) => img.src
    )

    const index = images.indexOf(img.src)

    setLightboxImages(images)
    setLightboxIndex(index >= 0 ? index : 0)
    setLightboxOpen(true)
  }

  return (
    <>
      <div className="grid gap-4">
        <div className="grid gap-2">
          {isAddingComment || isEditing ? (
            <div className="space-y-3">
              <Tiptap
                value={commentContent}
                onChange={setCommentContent}
                editable={!isSprintCompleted}
                image_uploading={true}
                entity="task-comments"
                showMentions={true}
                mentionUsers={availableUsers}
              />
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCommentContent("")
                    setIsEditing(false)
                    setIsAddingComment(false)
                  }}
                  disabled={creatingComment}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={
                    !commentContent.trim() ||
                    creatingComment ||
                    isSprintCompleted
                  }
                  loading={loading}
                >
                  {isEditing ? "Update Comment" : "Comment"}
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="min-h-[80px] border border-input rounded-md p-3 cursor-pointer hover:bg-card transition-colors flex items-center text-muted-foreground"
              onClick={() => setIsAddingComment(true)}
            >
              Write your comment here...
            </div>
          )}
        </div>
      </div>

      {/* LISTING THE COMMENTS */}
      <div className="grid gap-4 mt-4">
        {isEditing ? null : comments.length > 0 ? (
          comments.map((comment) => (
            <Card
              key={`${comment.id}-${comment.created_at}`}
              className="bg-card text-foreground border border-border"
            >
              <CardContent className="p-4 flex items-start gap-3">
                <div className="flex flex-row items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={
                        comment?.user?.profile_url || "/placeholder-user.jpg"
                      }
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
                        onClick={
                          lightboxOpen ? undefined : handleCommentImageClick
                        }
                        dangerouslySetInnerHTML={{ __html: comment.content }}
                      />
                    )}
                  </div>
                </div>
                {comment.type === "comment" && comment.user_id === userId ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setIsEditing(true)
                          setCommentContent(comment.content)
                          setCommentToUpdate(comment.id)
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setIsConfirmDeleteOpen(true)
                          setCommentToDelete(comment.id)
                        }}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
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

      {/* LIGHTBOX */}
      <ImageLightbox
        open={lightboxOpen}
        images={lightboxImages}
        index={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />

      {/* Confirmation Modal for deleting a comment */}
      <AlertDialog
        open={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment </AlertDialogTitle>
            <AlertDialogDescription>
              By leaving this, you will also be removed from related spaces.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              loading={DeleteCommentLoading}
              onClick={async () => handleDeleteComment(CommentToDelete)}
            >
              Delete Comment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
