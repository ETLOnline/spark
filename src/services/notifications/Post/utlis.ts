import { SelectFilePost, SelectPollPost, SelectPost, SelectSpace } from "@/src/db/schema";
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction";
import { NotificationPayload, sendPushNotification } from "../PushNotification.utils";
import { SendSystemNotification } from "../../system-notification/SystemNotification.utils";
import { createAbsoluteUrl } from "@/src/utils/clientHelper";

const getCTALink = (post: SelectPost | SelectFilePost | SelectPollPost, space?: SelectSpace) => {
  let CTALink = createAbsoluteUrl(`/posts/${post.id}`)
  if (space) {
    CTALink = createAbsoluteUrl(`/channels/${space?.channel?.channel_slug}/spaces/${space?.space_slug}?page-type=posts&post-id=${post.id}`)
  }
  return CTALink
}

// we will use this for sending like and comment becuase we have almost the things are same 
export const SendPostLikeOrCommentNotification = async (
  event: string,
  post: SelectPost | SelectFilePost | SelectPollPost,
  space?: SelectSpace
) => {
  try {
    const  contentType =  event == 'post_comment' ? 'comment' : 'like'
    const authUser = await AuthUserAction()
    if (!authUser) throw new Error("Unauthorized")

    const CTALink = getCTALink(post, space)
    const receivers = post.author.unique_id ? [post.author.unique_id] : [];
    if (receivers.length === 0) return

    const notificationPayload: NotificationPayload = {
      receivers: receivers,
      template: {
        title: `New Post ${contentType}`,
        body: `${authUser.first_name} ${authUser.last_name} ${contentType} your post.`,
        deep_link: CTALink,
        icon: authUser.profile_url || ""
      }
    }

    await sendPushNotification(notificationPayload)
    await SendSystemNotification({
      ...notificationPayload,
      user_id: authUser.unique_id
    })
  } catch (error) {
    console.error("Error sending notifications:", error)
  }
}
