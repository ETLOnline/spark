import { Button } from "@/src/components/ui/button"
import { useRef, useEffect } from "react"
import { Input } from "@/src/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { postStore } from "@/src/store/post/postStore"
import { useAtomValue, useSetAtom } from "jotai"
import { useServerAction } from "@/src/hooks/useServerAction"
import { CreateCommentAction } from "@/src/server-actions/Post/Post"
import { userStore } from "@/src/store/user/userStore"
import { useToast } from "@/src/hooks/use-toast"
import { SelectComment } from "@/src/db/schema"
import { X } from "lucide-react"

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
  const commentText = useRef<string>("")
  const commentInput = useRef<HTMLInputElement>(null)

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
    if (editingComment && commentInput.current) {
      commentInput.current.value = editingComment.content
      commentText.current = editingComment.content
      commentInput.current.focus()
    }
  }, [editingComment])

  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!commentText.current.trim()) {
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
        await onUpdateComment(editingComment.id, commentText.current)
      } else {
        // Create mode
        const response = await createComment(
          postId,
          commentText.current,
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
      commentText.current = ""
      if (commentInput.current) {
        commentInput.current.value = ""
      }
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
      className="flex items-center w-full space-x-2"
      onSubmit={handleAddComment}
    >
      <Avatar className="h-8 w-8 mt-4">
        <AvatarImage src={user?.profile_url as string} alt="Current User" />
        <AvatarFallback>{name}</AvatarFallback>
      </Avatar>
      <Input
        placeholder={
          isEditMode ? "Edit your comment..." : "Add a comment..."
        }
        onChange={(e) => (commentText.current = e.target.value)}
        className="flex-1 mt-4"
        ref={commentInput}
      />
      {isEditMode && onCancelEdit && (
        <Button
          size="sm"
          variant="ghost"
          className="mt-4"
          type="button"
          onClick={() => {
            onCancelEdit()
            commentText.current = ""
            if (commentInput.current) {
              commentInput.current.value = ""
            }
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <Button
        size="sm"
        className="mt-4"
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