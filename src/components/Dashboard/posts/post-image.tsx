import Image from "next/image"
import { CardContent, CardFooter } from "../../ui/card"
import { SelectComment, SelectFilePost } from "@/src/db/schema"
import { Badge } from "../../ui/badge"
import PostInteractions from "./post-interactions"
import { Separator } from "@/src/components/ui/separator"
import PostComments from "./post-comments"
import PostCommentForm from "./post-comment-form"
import PostCommentsSection from "./post-comments-section"
import { usePostNavigation } from "@/src/hooks/usePostNavigation"

type Props = {
  post: SelectFilePost
  spaceId?: string
}

const ImagePost: React.FC<Props> = ({ post, spaceId }) => {
  const { navigateToPost } = usePostNavigation()

  const handleContentClick = () => {
    navigateToPost(post.id, spaceId)
  }

  return (
    <>
      <CardContent
        className={spaceId !== "shared" ? "cursor-pointer" : ""}
        onClick={spaceId !== "shared" ? handleContentClick : undefined}
      >
        <p className="text-lg pb-5">{post.content}</p>
        {post?.file?.file_path ? (
          <Image
            src={post.file?.file_path}
            alt="Post image"
            className="rounded-lg max-h-96 w-full object-cover bg-gradient-to-r from-accent to-secondary"
            width={1000}
            height={1000}
            style={{ objectFit: "contain" }}
          />
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
        <PostCommentForm postId={post.id} comments={post.comments} spaceId={spaceId}/>
      </CardFooter>
    </>
  )
}

export default ImagePost
