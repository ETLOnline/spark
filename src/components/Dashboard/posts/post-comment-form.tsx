import { Button } from "@/src/components/ui/button"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { postStore } from "@/src/store/post/postStore"
import { useAtomValue, useSetAtom } from "jotai"
import { useServerAction } from "@/src/hooks/useServerAction"
import { CreateCommentAction } from "@/src/server-actions/Post/Post"
import { userStore } from "@/src/store/user/userStore"
import { useToast } from "@/src/hooks/use-toast"
import { SelectComment } from "@/src/db/schema"
import { PencilLine, X } from "lucide-react"
import RichTextEditor from "@/src/components/common/Tiptap/TiptapRichEditor"

type PostCommentFormProps = {
  postId: string
  comments: number
  spaceId?: string
  editingComment?: SelectComment | null
  onCancelEdit?: () => void
  onUpdateComment?: (commentId: number, newContent: string) => Promise<void>
}

const PostCommentForm: React.FC<PostCommentFormProps> = ({
  postId,
  comments,
  spaceId,
  editingComment,
  onCancelEdit,
  onUpdateComment
}) => {
  const [commentContent, setCommentContent] = useState("")
  const [showRichEditorToolbar, setShowRichEditorToolbar] = useState(false)

  const setPosts = useSetAtom(postStore.posts)
  const user = useAtomValue(userStore.AuthUser)

  const { toast } = useToast()

  const [
    createCommentLoading,
    createdComment,
    createCommentError,
    createComment
  ] = useServerAction(CreateCommentAction)

  const name = `${user?.first_name} ${user?.last_name}`
  const isEditMode = !!editingComment

  // Populate input when editing
  useEffect(() => {
    if (editingComment) {
      setCommentContent(editingComment.content)
    }
  }, [editingComment])

  const handleRichEditor = () => {
    setShowRichEditorToolbar((prev) => !prev)
  }

  const handleAddComment = async () => {
    if (!commentContent.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please write something in the comment box before posting."
      })
      return
    }

    try {
      if (isEditMode && onUpdateComment && editingComment) {
        // Edit mode
        await onUpdateComment(editingComment.id, commentContent)
      } else {
        // Create mode
        const response = await createComment(
          postId,
          commentContent,
          comments,
          spaceId
        )
        if (response?.data) {
          const addedComment = response.data
          if (addedComment) {
            setPosts((posts) =>
              posts.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      comments: (post.comments || 0) + 1,
                      postComments: [
                        addedComment,
                        ...(post.postComments as SelectComment[])
                      ]
                    }
                  : post
              )
            )
          }
          toast({
            title: "Comment added",
            description: "Your comment has been added successfully"
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error adding comment please try again!"
          })
        }
      }
      setCommentContent("")
      setShowRichEditorToolbar(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: isEditMode
          ? "Error updating comment please try again!"
          : "Error adding comment please try again!"
      })
    }
  }

  return (
    <form
      className="flex flex-col sm:flex-row sm:items-center w-full gap-2 mt-4"
      onSubmit={(e) => {
        e.preventDefault()
        handleAddComment()
      }}
    >
      <div className="flex items-center gap-2 w-full">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={user?.profile_url as string} alt="Current User" />
          <AvatarFallback>{name}</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex items-end gap-1 min-w-0">
          <div className="flex-1 min-w-0">
            <RichTextEditor
              value={commentContent}
              onChange={setCommentContent}
              image_uploading={false}
              entity="comments"
              showToolbar={showRichEditorToolbar}
              minHeight={showRichEditorToolbar ? "100px" : "30px"}
              limit={2000}
              onEnterPress={handleAddComment}
              showFooter={false}
              isScrollAble={true}
              placeholder={
                isEditMode ? "Edit your comment..." : "Add a comment..."
              }
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title={
              showRichEditorToolbar
                ? "Hide Formatting Menu (Enter sends)"
                : "Show Formatting Menu (Enter adds line)"
            }
            onClick={handleRichEditor}
            className={`p-1 shrink-0 ${
              showRichEditorToolbar ? "bg-secondary" : "hover:bg-secondary/50"
            }`}
          >
            <PencilLine className="h-5 w-5" />
          </Button>
        </div>
        {isEditMode && onCancelEdit && (
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => {
              onCancelEdit()
              setCommentContent("")
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Button
        size="sm"
        className="w-full sm:w-auto shrink-0"
        type="submit"
        loading={createCommentLoading}
        disabled={createCommentLoading}
      >
        {isEditMode ? "Update" : "Comment"}
      </Button>
    </form>
  )
}

export default PostCommentForm
