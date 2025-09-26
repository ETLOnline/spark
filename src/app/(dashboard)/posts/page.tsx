"use client"

import { useEffect, useState } from "react"
import PostFeed from "@/src/components/Dashboard/posts/post-feed"
import CreatePostForm from "@/src/components/Dashboard/posts/create-post-form"
import { SelectFilePost, SelectPollPost, SelectPost } from "@/src/db/schema"
import { GetPostsAction } from "@/src/server-actions/Post/Post"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

const PostsPage = () => {
  const [posts, setPosts] = useState<
    (SelectPost | SelectFilePost | SelectPollPost)[]
  >([])
  const [loading, setLoading] = useState(true)

  const { permissionChecker } = usePermissionChecker("global")
  const canViewPost = permissionChecker
    ? permissionChecker.canAccess("posting.view")
    : false

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await GetPostsAction()
        if (res?.data) {
          setPosts(res.data)
        } else {
          console.error("Failed to fetch posts", res.error)
        }
      } catch (error) {
        console.error("Error fetching posts!", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  return (
    <div className="container mx-auto p-4 space-y-8 max-w-3xl">
      <CreatePostForm />
      {loading ? (
        <div className="flex justify-center h-full w-full">
          <Loader size={LoaderSizes.xl} />
        </div>
      ) : canViewPost ? (
        <PostFeed fetchedPosts={posts} />
      ) : null}
    </div>
  )
}

export default PostsPage
