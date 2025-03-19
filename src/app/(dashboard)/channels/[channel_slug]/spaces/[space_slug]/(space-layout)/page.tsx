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
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/Loader/types/loader-types"

const SpacesPage: React.FC = () => {
  const params = useParams()

  const spaceSlug = params.space_slug
  const channelSlug = params.channel_slug

  const activeCategory = useAtomValue(spaceStore.activeCategory)

  const [postsLoading, posts, postsError, getPosts] =
    useServerAction(GetSpacePostsAction)
  const [spaceIdLoading, spaceIdData, spaceIdError, getSpaceId] =
    useServerAction(GetSpaceIdBySlugAction)
  const [channelIdLoading, channelIdData, channelIdError, getChannelId] =
    useServerAction(GetChannelIdBySlugAction)

  useEffect(() => {
    ; (async () => {
      const channelId = (await getChannelId(channelSlug as string))?.data
      if (channelId) {
        getSpaceId(spaceSlug as string, channelId)
      }
    })()
  }, [])

  useEffect(() => {
    if (spaceIdData) {
      getPosts(
        spaceIdData?.data as string,
        activeCategory === "All" ? "" : activeCategory
      )
    }
  }, [activeCategory, spaceIdData])

  return (
    <div className="container mx-auto p-4 space-y-8 max-w-3xl">
      <CreatePostForm variant="spaces" />
      <Card className="border-none">
        <CardHeader className="p-0 pb-6">
          <CardTitle>Feed</CardTitle>
          <CardDescription>Latest posts from {activeCategory}</CardDescription>
        </CardHeader>

        {postsLoading ?
          <div className="flex justify-center h-full w-full">
            <Loader size={LoaderSizes.xl} />
          </div>
          :
          posts?.data && (
            <PostFeed
              fetchedPosts={
                posts?.data as (SelectPost | SelectFilePost | SelectPollPost)[]
              }
            />
          )}
      </Card>
    </div>
  )
}

export default SpacesPage
