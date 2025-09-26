"use client"

import { useEffect, useRef, useState } from "react"
import {
  SelectFilePost,
  SelectPollPost,
  SelectPost,
  SelectUser
} from "@/src/db/schema"
import FilePost from "./post-file"
import ImagePost from "./post-image"
import PollPost from "./post-poll"
import TextPost from "./post-text"
import { useAtom } from "jotai"
import { postStore } from "@/src/store/post/postStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/src/components/ui/card"
import PostMenu from "./post-menu"
import NoDataCard from "../Channels/ChannelDetails/NoDataCard"
import { formatRelativeTime, GetUserRole } from "@/src/utils/helpers"
import {
  GetPostsAction,
  GetSpacePostsAction
} from "@/src/server-actions/Post/Post"
import { useServerAction } from "@/src/hooks/useServerAction"
import { Button } from "@/src/components/ui/button"

type PostFeedProps = {
  fetchedPosts: (SelectPost | SelectFilePost | SelectPollPost)[]
  spaceId?: string
  category?: string
}

const PostFeed: React.FC<PostFeedProps> = ({
  fetchedPosts,
  spaceId,
  category
}) => {
  const [posts, setPosts] = useAtom(postStore.posts)
  const offset = useRef<number>(10)
  const [hasMorePosts, setHasMorePosts] = useState<boolean>(true)
  const [loadingMore, setLoadingMore] = useState<boolean>(false)
  const previousCategory = useRef<string | undefined>(category)

  const [spacePostsLoading, oldSpacePosts, spacePostsError, getSpacePosts] =
    useServerAction(GetSpacePostsAction)
  const [postsLoading, oldPosts, postsError, getPosts] =
    useServerAction(GetPostsAction)

  const handleLoadMore = () => {
    if (loadingMore || !hasMorePosts) return
    setLoadingMore(true)
    fetchOldPosts()
  }

  useEffect(() => {
    const categoryChanged = previousCategory.current !== category
    previousCategory.current = category

    // Reset posts if category changed or this is initial load
    if (categoryChanged || posts.length === 0) {
      setPosts([...fetchedPosts])
      offset.current = 10
      setHasMorePosts(fetchedPosts.length === 10)
    }
  }, [fetchedPosts, category])

  useEffect(() => {
    if (oldPosts && oldPosts.success) {
      const newPosts = oldPosts?.data as (
        | SelectPost
        | SelectFilePost
        | SelectPollPost
      )[]
      setPosts((prevPosts) => [...prevPosts, ...newPosts])
      setHasMorePosts(newPosts.length === 10) // If we got less than 10, no more posts
      setLoadingMore(false)
    }
  }, [oldPosts])

  useEffect(() => {
    if (oldSpacePosts && oldSpacePosts.success) {
      const newPosts = oldSpacePosts?.data as (
        | SelectPost
        | SelectFilePost
        | SelectPollPost
      )[]
      setPosts((prevPosts) => [...prevPosts, ...newPosts])
      setHasMorePosts(newPosts.length === 10) // If we got less than 10, no more posts
      setLoadingMore(false)
    }
  }, [oldSpacePosts])

  const fetchOldPosts = () => {
    if (spaceId) {
      getSpacePosts(spaceId, category === "All" ? "" : category, offset.current)
    } else {
      getPosts(offset.current)
    }
    offset.current += 10
  }

  const handleGetUserRole = (user: SelectUser) => {
    if (spaceId) {
      return GetUserRole(user, spaceId)
    } else {
      return GetUserRole(user)
    }
  }

  console.log(posts.map((post) => post.author))

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <NoDataCard title="No posts available" />
      ) : (
        <>
          {posts.map((post) => {
            const name = `${post.author.first_name} ${post.author.last_name}`

            return (
              <Card className="bg-background shadow-lg" key={post.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={post.author.profile_url as string}
                          alt={name}
                        />
                        <AvatarFallback>{name}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{name}</p>
                        <p className="text-sm text-muted-foreground">
                          {handleGetUserRole(post.author)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(post.created_at || "")}
                        </p>
                      </div>
                    </div>
                    <PostMenu post={post} spaceId={spaceId} />
                  </div>
                </CardHeader>
                <CardContent>
                  {post.type === "text" ? (
                    <TextPost key={post.id} post={post} spaceId={spaceId} />
                  ) : post.type === "image" ? (
                    <ImagePost
                      key={post.id}
                      post={post as SelectFilePost}
                      spaceId={spaceId}
                    />
                  ) : post.type === "poll" ? (
                    <PollPost
                      key={post.id}
                      post={post as SelectPollPost}
                      spaceId={spaceId}
                    />
                  ) : (
                    post.type === "file" && (
                      <FilePost
                        key={post.id}
                        post={post as SelectFilePost}
                        spaceId={spaceId}
                      />
                    )
                  )}
                </CardContent>
              </Card>
            )
          })}

          {hasMorePosts && (
            <div className="flex justify-center mt-8 w-full">
              <Button
                onClick={handleLoadMore}
                loading={loadingMore}
                disabled={loadingMore}
                variant="outline"
                size="lg"
              >
                {loadingMore ? "Loading..." : "Load More Posts"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default PostFeed
