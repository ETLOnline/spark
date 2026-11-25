// Side effects of a post being published or reviewed. Server-only helpers, not server actions,
// so the client can't call them directly.
import { AddRewardAction } from "@/src/server-actions/Reward/Reward"
import { ActivityTypes } from "@/src/types/Rewards/rewards"
import { getPostUrl } from "@/src/utils/serverHelpers"
import {
  NotificationPayload,
  sendPushNotification
} from "../notifications/PushNotification.utils"
import { SendSystemNotification } from "../system-notification/SystemNotification.utils"

type ReviewedPost = { id: string; user_id: string; entity_id: string | null }

// Social post reward; given when the post is published (at creation, or when an admin approves it)
export const rewardPublishedPost = async (
  postId: string,
  userId: string,
  entityId?: string | null
) => {
  const { proof_url, communityId } = await getPostUrl(
    postId,
    entityId ?? undefined
  )
  await AddRewardAction(ActivityTypes.SocialPost, userId, proof_url, {
    community_id: communityId
  })
}

// Tells the author their post was approved or rejected
export const SendPostReviewedNotification = async (
  post: ReviewedPost,
  action: "approved" | "rejected",
  adminId: string
) => {
  try {
    const { proof_url } = await getPostUrl(post.id, post.entity_id ?? undefined)
    const notificationPayload: NotificationPayload = {
      receivers: [post.user_id],
      template:
        action === "approved"
          ? {
              title: "Post approved",
              body: "Your post was reviewed and is now visible to everyone.",
              deep_link: proof_url,
              icon: ""
            }
          : {
              title: "Post rejected",
              body: "Your post was reviewed and won't be published because it breaks our community guidelines.",
              // the post is hidden, so there is nothing to link to
              deep_link: "",
              icon: ""
            }
    }

    await sendPushNotification(notificationPayload)
    await SendSystemNotification({ ...notificationPayload, user_id: adminId })
  } catch (error) {
    console.error("Error sending post review notification:", error)
  }
}
