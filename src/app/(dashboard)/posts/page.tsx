"use client"

import { useEffect, useState } from "react"
import PostFeed from "@/src/components/Dashboard/posts/post-feed"
import CreatePostForm from "@/src/components/Dashboard/posts/create-post-form"
import { SelectFilePost, SelectPollPost, SelectPost } from "@/src/db/schema"
import { GetPostsAction } from "@/src/server-actions/Post/Post"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import { useAtom, useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { postStore } from "@/src/store/post/postStore"

const PostsPage = () => {
  const isSuperAdmin = Boolean(useAtomValue(userStore.SuperAdmin))
  const [posts, setPosts] = useState<
    (SelectPost | SelectFilePost | SelectPollPost)[]
  >([])
  const [loading, setLoading] = useState(true)
  const permission = useAtomValue(userStore.Permissions)
  const [permissionChecker, setPermissionChecker] = useAtom(
    postStore.permissionCheckerAtom
  ) // Store PermissionChecker

  useEffect(() => {
    if (
      (permission && !permissionChecker) ||
      (isSuperAdmin && !permissionChecker)
    ) {
      const checker = new PermissionChecker("global", permission, isSuperAdmin)
      setPermissionChecker(checker)
    }
  }, [permission, permissionChecker, setPermissionChecker, isSuperAdmin])
  const canViewPost = permissionChecker?.canAccess("posting.view")

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
