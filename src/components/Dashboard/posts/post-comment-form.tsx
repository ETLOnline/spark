import { Button } from "@/src/components/ui/button"
import { useRef } from "react"
import { Input } from "@/src/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { postStore } from "@/src/store/post/postStore"
import { useAtomValue, useSetAtom } from "jotai"
import { useServerAction } from "@/src/hooks/useServerAction"
import { createCommentAction } from "@/src/server-actions/Post/Post"
import { userStore } from "@/src/store/user/userStore"

type PostCommentFormProps = {
  postId: number
}

const PostCommentForm: React.FC<PostCommentFormProps> = ({ postId }) => {
  const commentText = useRef<string>("")

  const setPosts = useSetAtom(postStore.posts)
  const user = useAtomValue(userStore.AuthUser)

  const [
    createCommentLoading,
    createdComment,
    createCommentError,
    createComment
  ] = useServerAction(createCommentAction)

  const name = `${user?.first_name} ${user?.last_name}`

  const handleAddComment = async (postId: number) => {
    const response = await createComment(postId, commentText.current)
    const addedComment = response?.success ? response.data : null
    if (addedComment) {
      setPosts((posts) =>
        posts.map((post) =>
          post.id === postId
            ? { ...post, postComments: [...post.postComments, addedComment] }
            : post
        )
      )
    }
    commentText.current = ""
  }

  return (
    <div className="flex items-center w-full space-x-2">
      <Avatar className="h-8 w-8 mt-4">
        <AvatarImage src={user?.profile_url as string} alt="Current User" />
        <AvatarFallback>{name}</AvatarFallback>
      </Avatar>
      <Input
        placeholder="Add a comment..."
        onChange={(e) => (commentText.current = e.target.value)}
        className="flex-1"
      />
      <Button
        onClick={() => handleAddComment(postId)}
        size="sm"
        className="mt-4"
      >
        Comment
      </Button>
    </div>
  )
}

export default PostCommentForm
