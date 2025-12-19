import { CardContent, CardFooter } from "../../ui/card"
import PostInteractions from "./post-interactions"
import { Separator } from "@/src/components/ui/separator"
import PostCommentForm from "./post-comment-form"
import { SelectPost } from "@/src/db/schema"
import { Badge } from "../../ui/badge"
import PostCommentsSection from "./post-comments-section"
import ExpandableText from "./ExpandableText"

type Props = {
  post: SelectPost
  spaceId?: string
}

const TextPost: React.FC<Props> = ({ post, spaceId }) => {
  const content = post.content ?? ""

  return (
    <>
      <CardContent>
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

export default TextPost
