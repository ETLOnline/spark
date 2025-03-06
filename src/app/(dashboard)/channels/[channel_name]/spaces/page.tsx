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
import { useSearchParams } from "next/navigation"
import { useAtomValue } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetSpacePostsAction } from "@/src/server-actions/Post/Post"
import { SelectFilePost, SelectPollPost, SelectPost } from "@/src/db/schema"

const SpacesPage: React.FC = () => {
  const searchParams = useSearchParams()

  const spaceId = searchParams.get("space_id")

  const activeCategory = useAtomValue(spaceStore.activeCategory)

  const [postsLoading, posts, postsError, getPosts] =
    useServerAction(GetSpacePostsAction)

  useEffect(() => {
    if (spaceId) {
      getPosts(spaceId, activeCategory === "All" ? "" : activeCategory)
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
