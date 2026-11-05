"use server"

import {
  GetModerationPosts,
  ModerationPostFilters,
  ReviewPost
} from "@/src/db/data-access/post/query"
import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import { isSuperAdmin } from "@/src/utils/helpers"
import { PostStatus } from "@/src/types/Post/PostStatus"
import {
  rewardPublishedPost,
  SendPostReviewedNotification
} from "@/src/services/post/postReview"

// Only super admins can see and review held posts
const getSuperAdmin = async () => {
  const user = await AuthUserAction()
  if (!user || !(await isSuperAdmin(user))) {
    throw new Error("Forbidden", { cause: 403 })
  }
  return user
}

export const GetModerationPostsAction = CreateServerAction(
  true,
  async (filters: ModerationPostFilters) => {
    try {
      await getSuperAdmin()
      const res = await GetModerationPosts(filters)
      return {
        success: true,
        data: {
          ...res,
          posts: res.posts.map((post) => ({
            ...post,
            files: post.files?.map((f) => f.postFile) || []
          }))
        }
      }
    } catch (error: any) {
      console.error("Error in GetModerationPostsAction:", error)
      return { success: false, error: error.message || "Failed to fetch posts" }
    }
  }
)

export const ReviewPostAction = CreateServerAction(
  true,
  async (postId: string, action: "approve" | "reject") => {
    try {
      const admin = await getSuperAdmin()
      const post = await ReviewPost(
        postId,
        action === "approve" ? PostStatus.PUBLISHED : PostStatus.REJECTED,
        admin.unique_id
      )
      if (!post) {
        return { success: false, error: "This post has already been reviewed" }
      }

      if (action === "approve") {
        // held posts get no reward when created, so it is given now
        await rewardPublishedPost(post.id, post.user_id, post.entity_id)
      }
      await SendPostReviewedNotification(
        post,
        action === "approve" ? "approved" : "rejected",
        admin.unique_id
      )
      return { success: true, data: post }
    } catch (error: any) {
      console.error("Error in ReviewPostAction:", error)
      return { success: false, error: error.message || "Failed to review post" }
    }
  }
)
