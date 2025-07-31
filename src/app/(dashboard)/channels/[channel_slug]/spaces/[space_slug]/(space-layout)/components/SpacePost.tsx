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
import { useParams, useSearchParams } from "next/navigation"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetSpacePostsAction,
  GetPostByIdAction
} from "@/src/server-actions/Post/Post"
import { SelectFilePost, SelectPollPost, SelectPost } from "@/src/db/schema"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
import { postStore } from "@/src/store/post/postStore"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import SharedPostView from "@/src/components/Dashboard/posts/SharedPostView"
import { Button } from "@/src/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

const SpacePostComponent: React.FC = () => {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()

  const spaceSlug = params.space_slug as string
  const channelSlug = params.channel_slug as string

  const activeCategory = useAtomValue(spaceStore.activeCategory)
  const [space, setSpace] = useAtom(spaceStore.selectedSpace)
  const setLayoutStatsVisibility = useSetAtom(spaceStore.layoutStatsVisibility)
  const setPosts = useSetAtom(postStore.posts)
  const pageType = searchParams.get("page-type") || ""
  const postIdParam = searchParams.get("post-id")
  const isPostDetail = pageType === "posts" && !!postIdParam
  const postId = isPostDetail ? postIdParam : null

  useLayoutEffect(() => {
    setLayoutStatsVisibility(true)
    if (!isPostDetail) {
      setPosts([])
    }
  }, [isPostDetail])

  const [postsLoading, posts, postsError, getPosts] =
    useServerAction(GetSpacePostsAction)
  const [postDetailLoading, postDetail, postDetailError, getPostDetail] =
    useServerAction(GetPostByIdAction)

  useEffect(() => {
    GetSpaceBySlugAction(spaceSlug, channelSlug).then((space) => {
      if (space.success && space.data) {
        setSpace(space.data)
        if (isPostDetail && postId) {
          getPostDetail(postId)
        } else {
          getPosts(
            space.data.id,
            activeCategory === "All" ? "" : activeCategory
          )
        }
      }
    })
  }, [spaceSlug, channelSlug, isPostDetail, postId, activeCategory])

  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    space?.id
  )
  const canViewPost = permissionChecker
    ? permissionChecker.canAccess("space.posting.view")
    : false

  const handleBackToFeed = () => {
    router.push(`/channels/${channelSlug}/spaces/${spaceSlug}?page-type=posts`)
  }
  if (isPostDetail && postId) {
    return (
      <div className="container mx-auto space-y-8 max-w-3xl">
        <Button variant="outline" onClick={handleBackToFeed} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Feed
        </Button>

        {postDetailLoading ? (
          <div className="flex justify-center h-full w-full">
            <Loader size={LoaderSizes.xl} />
          </div>
        ) : postDetail?.data ? (
          <SharedPostView post={postDetail.data} spaceId={space?.id} />
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Post not found</p>
          </Card>
        )}
      </div>
    )
  }
  return (
    <div className="container mx-auto space-y-8 max-w-3xl">
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
