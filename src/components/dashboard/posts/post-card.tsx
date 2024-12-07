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
import PostContent from "./post-content"

type Props = {
  post: Post | PostFile | PostPoll
  posts: (Post | PostFile | PostPoll)[]
  setPosts: (posts: (Post | PostFile | PostPoll)[]) => void
}

const PostCard: React.FC<Props> = (props) => {
  return (
    <Card className="bg-background shadow-lg">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage
              src={props.post.author.avatar}
              alt={props.post.author.name}
            />
            <AvatarFallback>{props.post.author.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{props.post.author.name}</p>
            <p className="text-sm text-muted-foreground">
              {new Date(props.post.createdAt).toLocaleString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {props.post.type === "text" || props.post.type === "image" ? (
          <PostContent type={props.post.type} content={props.post.content} />
        ) : props.post.type === "file" ? (
          <PostContent
            type="file"
            content={props.post.content as string}
            fileName={(props.post as PostFile).fileName as string}
          />
        ) : (
          <PostContent
            type={props.post.type}
            content={props.post.content}
            options={(props.post as PostPoll).options}
          />
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {props.post.hashtags.map((tag) => (
            <Badge key={tag} variant="secondary">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        <PostInteractions
          likes={props.post.likes}
          comments={props.post.comments.length}
        />
        <Separator />
        <div className="w-full space-y-4">
          {props.post.comments.map((comment: Comment) => (
            <PostComments key={comment.id} comment={comment} />
          ))}
        </div>
        <PostCommentForm
          posts={props.posts}
          setPosts={props.setPosts}
          postId={props.post.id}
        />
      </CardFooter>
    </Card>
  )
}

export default PostCard
