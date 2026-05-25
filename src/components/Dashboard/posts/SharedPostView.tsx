"use client"

import { SelectFilePost, SelectPollPost, SelectPost } from "@/src/db/schema"
import { Card, CardContent, CardHeader } from "@/src/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import FilePost from "./post-file"
import ImagePost from "./post-image"
import PollPost from "./post-poll"
import TextPost from "./post-text"
import { useAtom } from "jotai"
import { postStore } from "@/src/store/post/postStore"
import { useEffect } from "react"
import { formatRelativeTime } from "@/src/utils/helpers"

interface SharedPostViewProps {
  post: SelectPost | SelectFilePost | SelectPollPost
  spaceId?: string
}

const SharedPostView: React.FC<SharedPostViewProps> = ({
  post: initialPost,
  spaceId
}) => {
  const [posts, setPosts] = useAtom(postStore.posts)

  useEffect(() => {
    setPosts([initialPost])
  }, [initialPost, setPosts])

  const post = posts.find((p) => p.id === initialPost.id) || initialPost
  const name = `${post.author.first_name} ${post.author.last_name}`
  const effectiveSpaceId = spaceId || "shared"

  return (
    <Card className="bg-background shadow-lg max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage src={post.author.profile_url as string} alt={name} />
              <AvatarFallback>{name}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">
                {formatRelativeTime(post.created_at || "")}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {post.type === "text" ? (
          <TextPost key={post.id} post={post} spaceId={effectiveSpaceId} />
        ) : post.type === "image" ? (
          <ImagePost
            key={post.id}
            post={post as SelectFilePost}
            spaceId={effectiveSpaceId}
          />
        ) : post.type === "poll" ? (
          <PollPost
            key={post.id}
            post={post as SelectPollPost}
            spaceId={effectiveSpaceId}
          />
        ) : (
          post.type === "file" && (
            <FilePost
              key={post.id}
              post={post as SelectFilePost}
              spaceId={effectiveSpaceId}
            />
          )
        )}
      </CardContent>
    </Card>
  )
}

export default SharedPostView
