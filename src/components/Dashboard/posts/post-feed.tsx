"use client"
import { PostStatus } from "@/src/types/Post/PostStatus"
import PostStatusBadge from "./post-status-badge"
import { PostFeedType } from "./types/posts-types"

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
import { formatRelativeTime, getUserRole } from "@/src/utils/helpers"
import {
  GetMyPostsAction,
  GetPostsAction,
  GetSpacePostsAction
} from "@/src/server-actions/Post/Post"
import { useServerAction } from "@/src/hooks/useServerAction"
import { Button } from "@/src/components/ui/button"
import { VerifiedBadge } from "@/src/components/ui/verified-badge"

type PostFeedProps = {
  fetchedPosts: (SelectPost | SelectFilePost | SelectPollPost)[]
  spaceId?: string
  category?: string
  feed?: PostFeedType
}

const PostFeed: React.FC<PostFeedProps> = ({
  fetchedPosts,
  spaceId,
  category,
  feed = "public"
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
  const [, oldMyPosts, , getMyPosts] = useServerAction(GetMyPostsAction)

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
    if (oldMyPosts && oldMyPosts.success) {
      const newPosts = oldMyPosts?.data as (
        | SelectPost
        | SelectFilePost
        | SelectPollPost
      )[]
      setPosts((prevPosts) => [...prevPosts, ...newPosts])
      setHasMorePosts(newPosts.length === 10)
      setLoadingMore(false)
    }
  }, [oldMyPosts])

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
    if (feed === "mine") {
      getMyPosts(
        offset.current,
        spaceId,
        category === "All" ? "" : (category ?? "")
      )
    } else if (spaceId) {
      getSpacePosts(spaceId, category === "All" ? "" : category, offset.current)
    } else {
      getPosts(offset.current)
    }
    offset.current += 10
  }

  // Public Posts never shows posts under review or rejected, e.g. one the user just created or edited
  const visiblePosts =
    feed === "public"
      ? posts.filter((p) => p.status === PostStatus.PUBLISHED)
      : posts

  return (
    <div className="space-y-6">
      {visiblePosts.length === 0 ? (
        <NoDataCard
          title={
            feed === "mine"
              ? "You haven't posted anything yet"
              : "No posts available"
          }
        />
      ) : (
        <>
          {visiblePosts.map((post) => {
            const name = `${post.author.first_name} ${post.author.last_name}`

            return (
              <Card className="bg-background shadow-lg" key={post.id}>
                <CardHeader className="p-4">
                  {/* left: author profile, right: status badge + menu */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center space-x-4">
                      <Avatar className="h-12 w-12 shrink-0">
                        <AvatarImage
                          src={post.author.profile_url as string}
                          alt={name}
                        />
                        <AvatarFallback>{name}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-semibold flex items-center gap-1">
                          {name}
                          {post.author.profile?.verified && (
                            <VerifiedBadge size={14} />
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getUserRole(post.author, spaceId)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatRelativeTime(post.created_at || "")}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {/* Under Review / Rejected, only shown in My Posts */}
                      <PostStatusBadge status={post.status} />
                      <PostMenu post={post} spaceId={spaceId} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
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
