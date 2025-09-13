import { SelectChat, SelectSpace } from "@/src/db/schema"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { sendBeamsNotification } from "../Helper"

export const SendChatNotification = async (
  event: string,
  chat: SelectChat,
  space?: SelectSpace
) => {
  try {
    const authUser = await AuthUserAction()
    if (!authUser) throw new Error("Unauthorized")

    let CTALink = "chat"
    if (space) {
      CTALink = `channels/${space?.channel?.channel_slug}/spaces/${space?.space_slug}?page-type=chat`
    }
    const user = chat.users

    const receivers =
      chat.users
        ?.filter((user) => user.user_id !== authUser.unique_id)
        .map((user) => `user-${user.user_id}`) || []

    const length = receivers.length

    if (receivers.length > 1) {
      await sendBeamsNotification({
        receivers: receivers,
        template: {
          title: `New Group Chat: ${chat.name}`,
          body: `You have been added to a new group chat.`,
          deep_link: `${process.env.NEXT_PUBLIC_BASE_URL}/${CTALink}`,
          icon: authUser.profile_url || ""
        }
      })
      return
    } else if (receivers.length === 1) {
      await sendBeamsNotification({
        receivers: receivers,
        template: {
          title: "New Chat Created",
          body: `${authUser.first_name} ${authUser.last_name} has started a new chat with you.`,
          deep_link: `${process.env.NEXT_PUBLIC_BASE_URL}/${CTALink}`,
          icon: authUser.profile_url || ""
        }
      })
    }
    return
  } catch (error) {
    console.error("Error sending notifications:", error)
  }
}
