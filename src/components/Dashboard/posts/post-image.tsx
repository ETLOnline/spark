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
  const images = post.files?.length
    ? post.files
    : post.file?.file_path
      ? [{ file_path: post.file.file_path }]
      : []

  const isSingle = images.length === 1

  return (
    <>
      <CardContent
        className={spaceId !== "shared" ? "cursor-pointer" : ""}
        onClick={spaceId !== "shared" ? handleContentClick : undefined}
      >
        <p className="text-lg pb-5">{post.content}</p>
        {/* Images */}
        {images.length > 0 && (
          <div
            className={`mt-4 grid gap-3 ${
              isSingle ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {images.map((file, idx) => (
              <div
                key={`${post.id}-file-${idx}`}
                className={`overflow-hidden rounded-lg bg-gradient-to-r from-accent to-secondary ${
                  isSingle ? "w-full" : "w-full"
                }`}
              >
                <Image
                  src={file.file_path}
                  alt={`Post image ${idx + 1}`}
                  width={isSingle ? 1200 : 600}
                  height={isSingle ? 700 : 350}
                  className={`w-full object-cover transition-transform duration-300 hover:scale-105 ${
                    isSingle ? "max-h-[32rem]" : "h-56"
                  }`}
                  priority={isSingle}
                />
              </div>
            ))}
          </div>
        )}

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

export default ImagePost
