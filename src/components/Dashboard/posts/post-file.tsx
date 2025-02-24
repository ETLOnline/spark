import { FileIcon } from "lucide-react"
import { SelectComment, SelectFilePost } from "@/src/db/schema"
import Link from "next/link"
import { CardContent, CardFooter } from "../../ui/card"
import { Badge } from "../../ui/badge"
import PostInteractions from "./post-interactions"
import { Separator } from "@/src/components/ui/separator"
import PostComments from "./post-comments"
import PostCommentForm from "./post-comment-form"

type Props = {
  post: SelectFilePost
}

const FilePost: React.FC<Props> = ({ post }) => {
  return (
    <>
      <CardContent>
        <Link href={post.file.file_path}>
          <div className="flex items-center space-x-2 bg-muted p-4 rounded-lg w-fit">
            <FileIcon className="h-8 w-8" />
            <span className="font-medium">{post.file.file_name}</span>
          </div>
        </Link>
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
        />
        <Separator />
        <div className="w-full space-y-4">
          {post.postComments &&
            post.postComments.map((comment: SelectComment) => (
              <PostComments key={comment.id} comment={comment} />
            ))}
        </div>
        <PostCommentForm postId={post.id} comments={post.comments} />
      </CardFooter>
    </>
  )
}

export default FilePost
