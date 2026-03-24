import { FileIcon } from "lucide-react"
import { SelectComment, SelectFilePost } from "@/src/db/schema"
import Link from "next/link"
import { CardContent, CardFooter } from "../../ui/card"
import { Badge } from "../../ui/badge"
import PostInteractions from "./post-interactions"
import { Separator } from "@/src/components/ui/separator"
import PostComments from "./post-comments"
import PostCommentForm from "./post-comment-form"
import { formatFileSize } from "@/src/utils/helpers"
import PostCommentsSection from "./post-comments-section"
import { usePostNavigation } from "@/src/hooks/usePostNavigation"
import { useState } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { UpdateCommentAction } from "@/src/server-actions/Post/Post"
import { useToast } from "@/src/hooks/use-toast"
import { useSetAtom } from "jotai"
import { postStore } from "@/src/store/post/postStore"

type Props = {
  post: SelectFilePost
  spaceId?: string
}

const FilePost: React.FC<Props> = ({ post, spaceId }) => {
  const { navigateToPost } = usePostNavigation()
  const [editingComment, setEditingComment] = useState<SelectComment | null>(null)
  const { toast } = useToast()
  const setPosts = useSetAtom(postStore.posts)

  const [updateCommentLoading, updatedComment, updateCommentError, updateComment] =
    useServerAction(UpdateCommentAction)

  const handleContentClick = () => {
    navigateToPost(post.id, spaceId)
  }

  const handleFileClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

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
      <CardContent
        className={spaceId !== "shared" ? "cursor-pointer" : ""}
        onClick={spaceId !== "shared" ? handleContentClick : undefined}
      >
        {post.category && (
          <Badge variant="outline" className="mb-2">
            {post.category}
          </Badge>
        )}
        <p className="text-lg pb-5">{post.content}</p>
        {post?.file ? (
          <Link href={post?.file?.file_path} onClick={handleFileClick}>
            <div className="flex items-center space-x-2 bg-muted p-4 rounded-lg w-fit">
              <FileIcon className="h-8 w-8" />
              <span className="font-medium">{post?.file?.file_name}</span>
              <span className="text-xs text-primary">
                {formatFileSize(post?.file?.file_size)}
              </span>
            </div>
          </Link>
        ) : null}
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

export default FilePost