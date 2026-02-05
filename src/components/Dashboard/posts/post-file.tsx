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

type Props = {
  post: SelectFilePost
  spaceId?: string
}

const FilePost: React.FC<Props> = ({ post, spaceId }) => {
  const { navigateToPost } = usePostNavigation()

  const handleContentClick = () => {
    navigateToPost(post.id, spaceId)
  }

  const handleFileClick = (e: React.MouseEvent) => {
    e.stopPropagation()
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
        <PostCommentsSection comments={post.postComments || []} />
        <PostCommentForm
          postId={post.id}
          comments={post.comments}
          spaceId={spaceId}
        />
      </CardFooter>
    </>
  )
}

export default FilePost
