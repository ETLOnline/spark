// server component

import { Comment, Post } from "./types/posts-types"
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
  posts: Post[]
  setPosts: (posts: Post[]) => void
}

const PostFeed: React.FC<Props> = (props) => {
  return (
    <div className="space-y-6">
      {props.posts.map((post: Post) => (
        <Card key={post.id} className="bg-background shadow-lg">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
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
            <PostContent
              type={post.type}
              content={post.content}
              options={post.options}
              fileName={post.fileName}
            />
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
              posts={props.posts}
              setPosts={props.setPosts}
              postId={post.id}
            />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export default PostFeed
