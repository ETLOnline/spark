import { CardContent, CardFooter } from "../../ui/card"
import PostInteractions from "./post-interactions"
import { Separator } from "@/src/components/ui/separator"
import PostComments from "./post-comments"
import PostCommentForm from "./post-comment-form"
import { SelectComment, SelectPost } from "@/src/db/schema"
import { Badge } from "../../ui/badge"
import PostCommentsSection from "./post-comments-section"
import { useRouter, useParams } from "next/navigation"

type Props = {
  post: SelectPost
  spaceId?: string
}

const TextPost: React.FC<Props> = ({ post, spaceId }) => {
  const router = useRouter()
  const params = useParams()

  const handleContentClick = () => {
    if (spaceId && spaceId !== "shared") {
      const channelSlug = params?.channel_slug as string
      const spaceSlug = params?.space_slug as string
      if (channelSlug && spaceSlug) {
        router.push(
          `/channels/${channelSlug}/spaces/${spaceSlug}?page-type=posts&post-id=${post.id}`
        )
      } else {
        router.push(`/posts/${post.id}`)
      }
    } else {
      router.push(`/posts/${post.id}`)
    }
  }

  return (
    <>
      <CardContent
        className={spaceId !== "shared" ? "cursor-pointer" : ""}
        onClick={spaceId !== "shared" ? handleContentClick : undefined}
      >
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
          spaceId={spaceId}
        />
        <Separator />
        <PostCommentsSection comments={post.postComments || []} />
        <PostCommentForm postId={post.id} comments={post.comments} />
      </CardFooter>
    </>
  )
}

export default TextPost
