import { CardFooter } from "../../ui/card"
import PostInteractions from "./post-interactions"
import { Separator } from "@/src/components/ui/separator"
import PostCommentForm from "./post-comment-form"
import PostCommentsSection from "./post-comments-section"
import { SelectComment, SelectPost } from "@/src/db/schema"
import { useState } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { UpdateCommentAction } from "@/src/server-actions/Post/Post"
import { useToast } from "@/src/hooks/use-toast"
import { useSetAtom } from "jotai"
import { postStore } from "@/src/store/post/postStore"
import { PostStatus } from "@/src/types/Post/PostStatus"

type Props = {
  post: SelectPost
  spaceId?: string
}

// Likes, share, comments and the comment form; the same for every post type
const PostFooter: React.FC<Props> = ({ post, spaceId }) => {
  const [editingComment, setEditingComment] = useState<SelectComment | null>(
    null
  )
  const [isCommentsVisible, setIsCommentsVisible] = useState(false)
  const { toast } = useToast()
  const setPosts = useSetAtom(postStore.posts)
  const [, , , updateComment] = useServerAction(UpdateCommentAction)

  const handleUpdateComment = async (commentId: number, newContent: string) => {
    try {
      const response = await updateComment(commentId, newContent)
      if (response?.data) {
        setPosts((posts) =>
          posts.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  postComments: (p.postComments as SelectComment[]).map((c) =>
                    c.id === commentId ? { ...c, content: newContent } : c
                  )
                }
              : p
          )
        )
        toast({
          title: "Comment updated",
          description: "Your comment has been updated successfully"
        })
        setEditingComment(null)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error updating comment please try again!"
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error updating comment please try again!"
      })
    }
  }

  // likes, comments and sharing open once the post is published
  if (post.status === PostStatus.PENDING_REVIEW) return null

  return (
    <CardFooter className="flex flex-col items-start space-y-4 p-0">
      <PostInteractions
        postId={post.id}
        likes={post.likes}
        comments={post.comments}
        likers={post.postLikes}
        spaceId={spaceId}
        isCommentsVisible={isCommentsVisible}
        setIsCommentsVisible={setIsCommentsVisible}
      />
      <Separator />
      {isCommentsVisible ? (
        <PostCommentsSection
          comments={post.postComments || []}
          onEditComment={setEditingComment}
        />
      ) : null}
      <PostCommentForm
        postId={post.id}
        comments={post.comments}
        spaceId={spaceId}
        editingComment={editingComment}
        onCancelEdit={() => setEditingComment(null)}
        onUpdateComment={handleUpdateComment}
      />
    </CardFooter>
  )
}

export default PostFooter
