"use client"

import { useEffect, useState } from "react"
import { SelectFilePost, SelectPollPost, SelectPost } from "@/src/db/schema"
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useSetAtom } from "jotai"
import { postStore } from "@/src/store/post/postStore"
import {
  GetMyPostsAction,
  GetPostsAction,
  GetSpacePostsAction
} from "@/src/server-actions/Post/Post"
import PostFeed from "./post-feed"
import { PostFeedType } from "./types/posts-types"

type FeedPost = SelectPost | SelectFilePost | SelectPollPost

type PostFeedTabsProps = {
  // first page of Public Posts, loaded by the page
  publicPosts: FeedPost[]
  spaceId?: string
  category?: string
}

// "Public Posts" (published posts of everyone) and "My Posts" (the user's posts in every status)
const PostFeedTabs: React.FC<PostFeedTabsProps> = ({
  publicPosts,
  spaceId,
  category
}) => {
  const [feed, setFeed] = useState<PostFeedType>("public")
  const [publicFeedPosts, setPublicFeedPosts] = useState(publicPosts)
  const [myFeedPosts, setMyFeedPosts] = useState<FeedPost[]>([])
  // true while the newly selected tab loads
  const [switching, setSwitching] = useState(false)
  const setPosts = useSetAtom(postStore.posts)

  const [, , , getMyPosts] = useServerAction(GetMyPostsAction)
  const [, , , getPosts] = useServerAction(GetPostsAction)
  const [, , , getSpacePosts] = useServerAction(GetSpacePostsAction)

  // the page reloads Public Posts, e.g. when the space category changes
  useEffect(() => {
    setPublicFeedPosts(publicPosts)
  }, [publicPosts])

  // Each tab reloads when it opens, so new posts and review decisions show up
  const handleTabChange = async (value: string) => {
    const nextFeed = value as PostFeedType
    const categoryFilter = category === "All" ? "" : (category ?? "")
    setSwitching(true)
    setFeed(nextFeed)
    // empty the shared post list, so PostFeed starts the new tab from its own posts
    setPosts([])
    try {
      if (nextFeed === "mine") {
        const res = await getMyPosts(0, spaceId, categoryFilter)
        if (res?.success && res.data) setMyFeedPosts(res.data)
      } else {
        const res = spaceId
          ? await getSpacePosts(spaceId, categoryFilter)
          : await getPosts()
        if (res?.success && res.data) setPublicFeedPosts(res.data)
      }
    } finally {
      setSwitching(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={feed} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 sm:inline-grid sm:w-auto">
          <TabsTrigger value="public">Public Posts</TabsTrigger>
          <TabsTrigger value="mine">My Posts</TabsTrigger>
        </TabsList>
      </Tabs>

      {switching ? (
        <div className="flex justify-center h-full w-full">
          <Loader size={LoaderSizes.xl} />
        </div>
      ) : (
        <PostFeed
          feed={feed}
          fetchedPosts={feed === "mine" ? myFeedPosts : publicFeedPosts}
          spaceId={spaceId}
          category={category}
        />
      )}
    </div>
  )
}

export default PostFeedTabs
