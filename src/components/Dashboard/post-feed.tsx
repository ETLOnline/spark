"use client"

import {
  SelectComment,
  SelectFilePost,
  SelectPollPost,
  SelectPost
} from "@/src/db/schema"
import FilePost from "./posts/post-file"
import ImagePost from "./posts/post-image"
import PollPost from "./posts/post-poll"
import TextPost from "./posts/post-text"
import { useEffect } from "react"
import { useAtom } from "jotai"
import { postStore } from "@/src/store/post/postStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Separator } from "@/src/components/ui/separator"
import PostInteractions from "./posts/post-interactions"
import PostComments from "./posts/post-comments"
import PostCommentForm from "./posts/post-comment-form"

type PostFeedProps = {
  ssrPosts: (SelectPost | SelectFilePost | SelectPollPost)[]
}

const PostFeed: React.FC<PostFeedProps> = ({ ssrPosts }) => {
  const [posts, setPosts] = useAtom(postStore.posts)

  useEffect(() => {
    setPosts([...ssrPosts])
  }, [ssrPosts])

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const name = `${post.author.first_name} ${post.author.last_name}`
        return (
          <Card className="bg-background shadow-lg" key={post.id}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src={post.author.profile_url as string}
                    alt={name}
                  />
                  <AvatarFallback>{name}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(post.created_at as string).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardHeader>
            {post.type === "text" ? (
              <TextPost key={post.id} post={post} />
            ) : post.type === "image" ? (
              <ImagePost
                key={post.id}
                post={post as SelectFilePost}
              />
            ) : post.type === "poll" ? (
              <PollPost key={post.id} post={post as SelectPollPost} />
            ) : (
              post.type === "file" && (
                <FilePost key={post.id} post={post as SelectFilePost} />
              )
            )}
          </Card>
        )
      })}
    </div>
  )
}

export default PostFeed
