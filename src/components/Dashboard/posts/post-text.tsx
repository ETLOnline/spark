import { CardContent, CardFooter } from "../../ui/card"
import PostInteractions from "./post-interactions"
import { Separator } from "@/src/components/ui/separator"
import PostCommentForm from "./post-comment-form"
import { SelectComment, SelectPost } from "@/src/db/schema"
import { Badge } from "../../ui/badge"
import PostCommentsSection from "./post-comments-section"
import ExpandableText from "./ExpandableText"
import { useState } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { UpdateCommentAction } from "@/src/server-actions/Post/Post"
import { useToast } from "@/src/hooks/use-toast"
import { useSetAtom } from "jotai"
import { postStore } from "@/src/store/post/postStore"

type Props = {
  post: SelectPost
  spaceId?: string
}

const TextPost: React.FC<Props> = ({ post, spaceId }) => {
  const content = post.content ?? ""
  const [editingComment, setEditingComment] = useState<SelectComment | null>(null)
  const { toast } = useToast()
  const setPosts = useSetAtom(postStore.posts)

  const [updateCommentLoading, updatedComment, updateCommentError, updateComment] =
    useServerAction(UpdateCommentAction)

  const handleEditComment = (comment: SelectComment) => {
    setEditingComment(comment)
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
  }

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

  return (
    <>
      <CardContent>
        {post.category && (
          <Badge variant="outline" className="mb-2">
            {post.category}
          </Badge>
        )}
        <ExpandableText content={content} lines={6} />

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
        <PostCommentsSection
          comments={post.postComments || []}
          onEditComment={handleEditComment}
        />
        <PostCommentForm
          postId={post.id}
          comments={post.comments}
          spaceId={spaceId}
          editingComment={editingComment}
          onCancelEdit={handleCancelEdit}
          onUpdateComment={handleUpdateComment}
        />
      </CardFooter>
    </>
  )
}

export default TextPost