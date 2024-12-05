// server component

import { Comment, Post } from "@/src/app/(dashboard)/posts/page"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"
import { Badge } from "@/src/components/ui/badge"
import { Separator } from "@/src/components/ui/separator"
import { FileIcon } from "lucide-react"
import PostInteractions from "./post-interactions"
import PostComments from "./post-comments"
import PostCommentForm from "./post-comment-form"

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
            {post.type === "text" && <p className="text-lg">{post.content}</p>}
            {post.type === "image" && (
              <img
                src={post.content}
                alt="Post image"
                className="rounded-lg max-h-96 w-full object-cover"
              />
            )}
            {post.type === "poll" && (
              <div>
                <p className="font-semibold mb-2">{post.content}</p>
                <RadioGroup>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="option1" />
                    <Label htmlFor="option1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="option2" />
                    <Label htmlFor="option2">Option 2</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            {post.type === "file" && (
              <div className="flex items-center space-x-2 bg-muted p-4 rounded-lg">
                <FileIcon className="h-8 w-8" />
                <span className="font-medium">Attached File</span>
              </div>
            )}
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
