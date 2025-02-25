import { CardContent, CardFooter } from "../../ui/card"
import PostInteractions from "./post-interactions"
import { Separator } from "@/src/components/ui/separator"
import PostComments from "./post-comments"
import PostCommentForm from "./post-comment-form"
import { SelectComment, SelectPost } from "@/src/db/schema"
import { Badge } from "../../ui/badge"

type Props = {
  post: SelectPost
}

const TextPost: React.FC<Props> = ({ post }) => {
  return (
    <>
      <CardContent>
        <p className="text-lg">{post.content}</p>
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

export default TextPost
