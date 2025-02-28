import Image from "next/image"
import { CardContent, CardFooter } from "../../ui/card"
import { SelectComment, SelectFilePost } from "@/src/db/schema"
import { Badge } from "../../ui/badge"
import PostInteractions from "./post-interactions"
import { Separator } from "@/src/components/ui/separator"
import PostComments from "./post-comments"
import PostCommentForm from "./post-comment-form"

type Props = {
  post: SelectFilePost
}

const ImagePost: React.FC<Props> = ({ post }) => {
  return (
    <>
      <CardContent>
        <p className="text-lg pb-5">{post.content}</p>
        <Image
          src={post.file.file_path}
          alt="Post image"
          className="rounded-lg max-h-96 w-full object-cover bg-gradient-to-r from-accent to-secondary"
          width={1000}
          height={1000}
          style={{ objectFit: "contain" }}
        />
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

export default ImagePost
