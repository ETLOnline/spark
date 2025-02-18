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
import { useServerAction } from "@/src/hooks/useServerAction"
import { IsPostLikedAction } from "@/src/server-actions/Post/Post"
import { PostFile } from "./posts/types/posts-types"

type PostFeedProps = {
  fetchedPosts: (SelectPost | SelectFilePost | SelectPollPost)[]
}

const PostFeed: React.FC<PostFeedProps> = ({ fetchedPosts }) => {
  const [posts, setPosts] = useAtom(postStore.posts)

  useEffect(() => {
    setPosts([...fetchedPosts])
  }, [fetchedPosts])

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
            <CardContent>
              {post.type === "text" ? (
                <TextPost key={post.id} postText={post.content as string} />
              ) : post.type === "image" ? (
                <ImagePost
                  key={post.id}
                  postImg={(post as SelectFilePost).file.file_path as string}
                />
              ) : post.type === "poll" ? (
                <PollPost key={post.id} post={post as SelectPollPost} />
              ) : (
                post.type === "file" && (
                  <FilePost key={post.id} post={post as SelectFilePost} />
                )
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {post.hashtags.map((tag) => (
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
              />
              <Separator />
              <div className="w-full space-y-4">
                {post.postComments.map((comment: SelectComment) => (
                  <PostComments key={comment.id} comment={comment} />
                ))}
              </div>
              <PostCommentForm postId={post.id} />
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}

export default PostFeed
