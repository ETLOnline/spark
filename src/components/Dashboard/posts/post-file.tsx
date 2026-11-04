import PostAiTags from "./post-ai-tags"
import PostFooter from "./post-footer"
import { FileIcon } from "lucide-react"
import { SelectFilePost } from "@/src/db/schema"
import Link from "next/link"
import { CardContent } from "../../ui/card"
import { Badge } from "../../ui/badge"
import { formatFileSize } from "@/src/utils/helpers"
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
        className={`p-0 ${spaceId !== "shared" ? "cursor-pointer" : ""}`}
        onClick={spaceId !== "shared" ? handleContentClick : undefined}
      >
        {post.category && (
          <Badge variant="outline" className="mb-2">
            {post.category}
          </Badge>
        )}
        {post.content && (
          <div
            className="rich-editor text-lg pb-5"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}
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
          <PostAiTags tags={post.ai_tags} />
          {post.hashtags &&
            post.hashtags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                #{tag.name}
              </Badge>
            ))}
        </div>
      </CardContent>
      <PostFooter post={post} spaceId={spaceId} />
    </>
  )
}

export default FilePost
