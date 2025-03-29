"use client"

import { useState, useEffect } from "react"
import { SelectFilePost, SelectPollPost, SelectPost } from "@/src/db/schema"
import FilePost from "./posts/post-file"
import ImagePost from "./posts/post-image"
import PollPost from "./posts/post-poll"
import TextPost from "./posts/post-text"
import { useAtom } from "jotai"
import { postStore } from "@/src/store/post/postStore"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/src/components/ui/card"
import PostMenu from "./posts/post-menu"
import moment from "moment-timezone"
import NoDataCard from "./Channels/ChannelDetails/NoDataCard"
import {
  GetPostsAction,
  GetSpacePostsAction
} from "@/src/server-actions/Post/Post"
import { useServerAction } from "@/src/hooks/useServerAction"

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
  const [offset, setOffset] = useState(0)

  const [spacePostsLoading, oldSpacePosts, spacePostsError, getSpacePosts] =
    useServerAction(GetSpacePostsAction)
  const [postsLoading, oldPosts, postsError, getPosts] =
    useServerAction(GetPostsAction)

  useEffect(() => {
    setPosts([...fetchedPosts])
  }, [fetchedPosts, setPosts])

  useEffect(() => {
    if (oldPosts && oldPosts.success) {
      setPosts((prevPosts) => [
        ...prevPosts,
        ...(
          oldPosts?.data as (SelectPost | SelectFilePost | SelectPollPost)[]
        ).reverse()
      ])
    }
  }, [oldPosts, setPosts])

  useEffect(() => {
    if (oldSpacePosts && oldSpacePosts.success) {
      setPosts((prevPosts) => [
        ...prevPosts,
        ...(
          oldSpacePosts?.data as (
            | SelectPost
            | SelectFilePost
            | SelectPollPost
          )[]
        ).reverse()
      ])
    }
  }, [oldSpacePosts, setPosts])

  const fetchOldPosts = () => {
    if (spaceId) {
      getSpacePosts(spaceId, category === "All" ? "" : category, offset)
    } else {
      getPosts(offset)
    }
    setOffset((prevOffset) => prevOffset + 10)
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrolledToBottom =
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 100
      if (scrolledToBottom && !postsLoading && !spacePostsLoading) {
        fetchOldPosts()
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [offset, postsLoading, spacePostsLoading, spaceId, category])

  return (
    <div className="space-y-6">
      {posts.length === 0 ? (
        <NoDataCard title="No posts available" />
      ) : (
        posts.map((post) => {
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
                        {moment
                          .utc(post.created_at || "")
                          .local()
                          .fromNow()}
                      </p>
                    </div>
                  </div>
                  <PostMenu post={post} />
                </div>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}

export default PostFeed
