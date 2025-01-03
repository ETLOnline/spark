import { Post, Comment, PostFile, PostPoll } from "./types/posts-types"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Separator } from "@/src/components/ui/separator"
import PostInteractions from "./post-interactions"
import PostComments from "./post-comments"
import PostCommentForm from "./post-comment-form"
import { FileIcon } from "lucide-react"

type Props = {
  post: PostFile
  posts: (Post | PostFile | PostPoll)[]
  setPosts: (posts: (Post | PostFile | PostPoll)[]) => void
}

const FilePost: React.FC<Props> = ({post, posts, setPosts}) => {
  return (
    <Card className="bg-background shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage
              src={post.author.avatar}
              alt={post.author.name}
            />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.author.name}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 bg-muted p-4 rounded-lg">
          <FileIcon className="h-8 w-8" />
          <span className="font-medium">{post.fileName}</span>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.hashtags.map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        <PostInteractions
          likes={post.likes}
          comments={post.comments.length}
        />
        <Separator />
        <div className="w-full space-y-4">
          {post.comments.map((comment: Comment) => (
            <PostComments key={comment.id} comment={comment} />
          ))}
        </div>
        <PostCommentForm
          posts={posts}
          setPosts={setPosts}
          postId={post.id}
        />
      </CardFooter>
    </Card>
  )
}

export default FilePost
