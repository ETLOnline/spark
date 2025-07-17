import { Button } from "@/src/components/ui/button"
import { useRef } from "react"
import { Input } from "@/src/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { postStore } from "@/src/store/post/postStore"
import { useAtomValue, useSetAtom } from "jotai"
import { useServerAction } from "@/src/hooks/useServerAction"
import { CreateCommentAction } from "@/src/server-actions/Post/Post"
import { userStore } from "@/src/store/user/userStore"
import { useToast } from "@/src/hooks/use-toast"
import { SelectComment } from "@/src/db/schema"

type PostCommentFormProps = {
  postId: string
  comments: number
}

const PostCommentForm: React.FC<PostCommentFormProps> = ({
  postId,
  comments
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

  const handleAddComment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const response = await createComment(
        postId,
        commentText.current,
        comments
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
                      ...(post.postComments as SelectComment[]),
                      addedComment
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
      commentText.current = ""
      if (commentInput.current) {
        commentInput.current.value = ""
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error adding comment please try again!"
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
        placeholder="Add a comment..."
        onChange={(e) => (commentText.current = e.target.value)}
        className="flex-1 mt-4"
        ref={commentInput}
      />
      <Button
        size="sm"
        className="mt-4 text-primary"
        type="submit"
        loading={createCommentLoading}
        disabled={createCommentLoading}
      >
        Comment
      </Button>
    </form>
  )
}

export default PostCommentForm
