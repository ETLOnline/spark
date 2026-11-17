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
import {
  createFeatureFlag,
  getFeatureFlag,
  updateFeatureFlag
} from "@/src/db/data-access/feature-flags/query"
import {
  AI_POST_MODERATION_ENABLED,
  PRIVATE_COMMUNITY_AI_POST_MODERATION_ENABLED
} from "@/src/utils/constants"

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

// Feature flags an admin can switch from the Post Moderation settings.
// Both stay on unless the flag exists and is switched off (same rule as post creation).
const POST_MODERATION_SETTINGS = {
  [AI_POST_MODERATION_ENABLED]: "Post Moderation",
  [PRIVATE_COMMUNITY_AI_POST_MODERATION_ENABLED]:
    "Private Community AI Moderation"
} as const

export type PostModerationSettingKey = keyof typeof POST_MODERATION_SETTINGS

export const GetPostModerationSettingsAction = CreateServerAction(
  true,
  async () => {
    try {
      await getSuperAdmin()
      const keys = Object.keys(
        POST_MODERATION_SETTINGS
      ) as PostModerationSettingKey[]
      const flags = await Promise.all(keys.map((key) => getFeatureFlag([key])))
      const data = Object.fromEntries(
        keys.map((key, i) => [key, flags[i]?.is_enabled ?? true])
      ) as Record<PostModerationSettingKey, boolean>
      return { success: true, data }
    } catch (error: any) {
      console.error("Error in GetPostModerationSettingsAction:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch post moderation settings"
      }
    }
  }
)

// Switches one post moderation flag on or off, creating it if it was never seeded
export const UpdatePostModerationSettingAction = CreateServerAction(
  true,
  async (key: PostModerationSettingKey, is_enabled: boolean) => {
    try {
      await getSuperAdmin()
      if (!(key in POST_MODERATION_SETTINGS)) {
        return { success: false, error: "Unknown setting" }
      }
      const existing = await getFeatureFlag([key])
      const flag = existing
        ? await updateFeatureFlag(key, { is_enabled })
        : await createFeatureFlag({
            key,
            label: POST_MODERATION_SETTINGS[key],
            is_enabled
          })
      return { success: true, data: { is_enabled: !!flag?.is_enabled } }
    } catch (error: any) {
      console.error("Error in UpdatePostModerationSettingAction:", error)
      return {
        success: false,
        error: error.message || "Failed to update post moderation setting"
      }
    }
  }
)
