"use client"

import CreatePostForm from "@/src/components/Dashboard/posts/create-post-form"
import PostFeed from "@/src/components/Dashboard/posts/post-feed"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/src/components/ui/card"
import { useEffect, useLayoutEffect } from "react"
import { useParams } from "next/navigation"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetSpacePostsAction } from "@/src/server-actions/Post/Post"
import { SelectFilePost, SelectPollPost, SelectPost } from "@/src/db/schema"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import { userStore } from "@/src/store/user/userStore"
import { postStore } from "@/src/store/post/postStore"

const SpacePostComponent: React.FC = () => {
  const params = useParams()

  const spaceSlug = params.space_slug as string
  const channelSlug = params.channel_slug as string

  const activeCategory = useAtomValue(spaceStore.activeCategory)
  const [space, setSpace] = useAtom(spaceStore.selectedSpace)
  const setLayoutStatsVisibility = useSetAtom(spaceStore.layoutStatsVisibility)

  useLayoutEffect(() => {
    setLayoutStatsVisibility(true)
  }, [])

  const [postsLoading, posts, postsError, getPosts] =
    useServerAction(GetSpacePostsAction)

  useEffect(() => {
    GetSpaceBySlugAction(spaceSlug, channelSlug).then((space) => {
      if (space.success && space.data) {
        setSpace(space.data)
        getPosts(space.data.id, activeCategory === "All" ? "" : activeCategory)
      }
    })
  }, [])

  const permission = useAtomValue(userStore.Permissions)
  const [permissionChecker, setPermissionChecker] = useAtom(
    postStore.permissionCheckerAtom
  ) // Store PermissionChecker

  // Initialize PermissionChecker if not already set
  useEffect(() => {
    if (permission && !permissionChecker) {
      const checker = new PermissionChecker(
        "scoped",
        permission,
        "space",
        space?.id
      )
      setPermissionChecker(checker)
    }
  }, [permission, permissionChecker, setPermissionChecker])
  // const permissionChecker = new PermissionChecker("global", permission)
  const canViewPost = permissionChecker?.canAccess("posting.view")

  return (
    <div className="container mx-auto  space-y-8 max-w-3xl">
      <CreatePostForm variant="spaces" />
      <Card className="border-none shadow-none">
        <CardHeader className="p-0 pb-6">
          <CardTitle>Feed</CardTitle>
          <CardDescription>Latest posts from {activeCategory}</CardDescription>
        </CardHeader>

        {postsLoading ? (
          <div className="flex justify-center h-full w-full">
            <Loader size={LoaderSizes.xl} />
          </div>
        ) : (
          posts?.data &&
          canViewPost && (
            <PostFeed
              fetchedPosts={
                posts?.data as (SelectPost | SelectFilePost | SelectPollPost)[]
              }
              spaceId={space?.id}
              category={activeCategory}
            />
          )
        )}
      </Card>
    </div>
  )
}

export default SpacePostComponent
