import { SelectChat, SelectSpace } from "@/src/db/schema"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import pusherServer from "../../realtime/pusherServer"
import {
  NotificationPayload,
  sendPushNotification
} from "../PushNotification.utils"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"

type PusherUsersResponse = {
  users: { id: string }[]
}

const getCTALink = (chat: SelectChat, space?: SelectSpace) => {
  let CTALink = `chat?active_chat=${chat.chat_slug}`
  if (space) {
    CTALink = `channels/${space?.channel?.channel_slug}/spaces/${space?.space_slug}?page-type=chat&active_chat=${chat.chat_slug}`
  }
  return CTALink
}

export const SendChatNotification = async (
  event: string,
  chat: SelectChat,
  space?: SelectSpace
) => {
  try {
    const authUser = await AuthUserAction()
    if (!authUser) throw new Error("Unauthorized")

    const CTALink = getCTALink(chat, space)
    const user = chat.users

    const receivers =
      chat.users
        ?.filter((user) => user.user_id !== authUser.unique_id)
        .map((user) => `user-${user.user_id}`) || []

    if (receivers.length === 0) return

    const isGroupChat = receivers.length > 1

    let notificationPayload: NotificationPayload = {
      receivers: receivers,
      template: {
        title: "New Chat Created",
        body: `${authUser.first_name} ${authUser.last_name} has started a new chat with you.`,
        deep_link: `${process.env.NEXT_PUBLIC_BASE_URL}/${CTALink}`,
        icon: authUser.profile_url || ""
      }
    }

    if (isGroupChat) {
      notificationPayload = {
        receivers: receivers,
        template: {
          title: `New Group Chat: ${chat.name}`,
          body: `You have been added to a new group chat.`,
          deep_link: `${process.env.NEXT_PUBLIC_BASE_URL}/${CTALink}`,
          icon: authUser.profile_url || ""
        }
      }
    }

    await sendPushNotification(notificationPayload)
  } catch (error) {
    console.error("Error sending notifications:", error)
  }
}

export const SendMessageNotification = async (
  message: SelectChat,
  space?: SelectSpace
) => {
  try {
    const authUser = await AuthUserAction()

    const CTALink = getCTALink(message, space)

    const chatReciversIds =
      message.users &&
      message.users
        .filter((userChat) => userChat.user_id !== authUser.unique_id)
        .map((userChat) => userChat.user_id)

    const presenceChannelName = `presence-chat-${message.id}`

    // Call Pusher HTTP API
    const presenceChannelResponse = await pusherServer.get({
      path: `/channels/${presenceChannelName}/users`
    })

    // Parse JSON body
    const presenceChannelUsers =
      (await presenceChannelResponse.json()) as PusherUsersResponse

    // Check if userId is in the list
    const nonPresentReciversIds =
      chatReciversIds &&
      chatReciversIds
        .filter(
          (userId) =>
            !presenceChannelUsers.users.find((user) => user.id === userId)
        )
        .map((userId) => `user-${userId}`)

    if (nonPresentReciversIds?.length && nonPresentReciversIds.length > 0) {
      // Only send push if user is NOT present
      await sendPushNotification({
        receivers: nonPresentReciversIds,
        template: {
          title: `Spark- ${authUser.first_name} ${authUser.last_name} sent you a message`,
          body: message.last_message || "",
          deep_link: createAbsoluteUrl(CTALink),
          icon: authUser.profile_url || ""
        }
      })
    }
  } catch (error) {
    console.error("Error sending notifications:", error)
  }
}
