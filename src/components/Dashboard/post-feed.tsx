"use client"

import { SelectFilePost, SelectPollPost, SelectPost } from "@/src/db/schema"
import FilePost from "./posts/post-file"
import ImagePost from "./posts/post-image"
import PollPost from "./posts/post-poll"
import TextPost from "./posts/post-text"
import { useEffect } from "react"
import { useAtom, useAtomValue } from "jotai"
import { postStore } from "@/src/store/post/postStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Card, CardHeader } from "@/src/components/ui/card"
import PostMenu from "./posts/post-menu"
import { userStore } from "@/src/store/user/userStore"

type PostFeedProps = {
  fetchedPosts: (SelectPost | SelectFilePost | SelectPollPost)[]
}

const PostFeed: React.FC<PostFeedProps> = ({ fetchedPosts }) => {
  const [posts, setPosts] = useAtom(postStore.posts)
  const user = useAtomValue(userStore.AuthUser)

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
              <div className="flex items-center justify-between">
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
                {user?.unique_id === post.author.unique_id ? (
                  <PostMenu postId={post.id} />
                ) : null}
              </div>
            </CardHeader>
            {post.type === "text" ? (
              <TextPost key={post.id} post={post} />
            ) : post.type === "image" ? (
              <ImagePost key={post.id} post={post as SelectFilePost} />
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
