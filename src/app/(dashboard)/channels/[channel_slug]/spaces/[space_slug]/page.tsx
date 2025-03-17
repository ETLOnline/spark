"use client"

import CreatePostForm from "@/src/components/Dashboard/create-post-form"
import PostFeed from "@/src/components/Dashboard/post-feed"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/src/components/ui/card"
import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useAtomValue } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetSpacePostsAction } from "@/src/server-actions/Post/Post"
import { SelectFilePost, SelectPollPost, SelectPost } from "@/src/db/schema"
import { GetSpaceIdBySlugAction } from "@/src/server-actions/Space/Space"
import { GetChannelIdBySlugAction } from "@/src/server-actions/Channel/Channel"

const SpacesPage: React.FC = () => {
  const params = useParams()

  const spaceSlug = params.space_slug
  const channelSlug = params.channel_slug

  const activeCategory = useAtomValue(spaceStore.activeCategory)

  const [postsLoading, posts, postsError, getPosts] =
    useServerAction(GetSpacePostsAction)
  const [SpaceIdLoading, SpaceIdData, SpaceIdError, getSpaceId] =
    useServerAction(GetSpaceIdBySlugAction)
  const [channelIdLoading, channelIdData, channelIdError, getChannelId] =
    useServerAction(GetChannelIdBySlugAction)

  useEffect(() => {
    getChannelId(channelSlug as string)
  }, [])

  useEffect(() => {
    if (channelIdData?.data) {
      getSpaceId(spaceSlug as string, channelIdData.data)
    }
  }, [channelIdData])

  useEffect(() => {
    if (spaceSlug) {
      getPosts(
        SpaceIdData?.data as string,
        activeCategory === "All" ? "" : activeCategory
      )
    }
  }, [activeCategory])

  return (
    <div className="container mx-auto space-y-8">
      <CreatePostForm variant="spaces" />
      <Card>
        <CardHeader>
          <CardTitle>Feed</CardTitle>
          <CardDescription>Latest posts from {activeCategory}</CardDescription>
        </CardHeader>
        <CardContent>
          {posts?.data && (
            <PostFeed
              fetchedPosts={
                posts?.data as (SelectPost | SelectFilePost | SelectPollPost)[]
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default SpacesPage
