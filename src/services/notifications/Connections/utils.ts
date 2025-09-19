import { SelectUserContact } from "@/src/db/schema"
import {
  NotificationPayload,
  sendPushNotification
} from "../PushNotification.utils"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"

export const SendConnectionNotification = async (
  event_type: string,
  connection: SelectUserContact
) => {
  try {
    const authUser = await AuthUserAction()

    const contacts = [connection.contact_id, connection.user_id]

    const receiverIds = contacts
      .filter((id) => id !== authUser.unique_id)
      .map((id) => `user-${id}`)

    const sendRequestURL = createAbsoluteUrl("/connections")
    const acceptedRequestURL = createAbsoluteUrl(
      `/profile/${authUser.unique_id}`
    )

    const notificationPayload: NotificationPayload = {
      receivers: receiverIds,
      template: {
        title: "New Connection Request",
        body: `${authUser.first_name} ${authUser.last_name} sent you a connection request.`,
        icon: authUser.profile_url || "",
        deep_link: sendRequestURL
      }
    }

    switch (event_type) {
      case "connection_request":
        notificationPayload.template.title = "New Connection Request"
        notificationPayload.template.body = `${authUser.first_name} ${authUser.last_name} sent you a connection request.`
        notificationPayload.template.deep_link = sendRequestURL
        break
      case "connection_accepted":
        notificationPayload.template.title = "Connection Request Accepted"
        notificationPayload.template.body = `${authUser.first_name} ${authUser.last_name}  has accepted your connection request. You’re now connected.`
        notificationPayload.template.deep_link = acceptedRequestURL
        break
      default:
        break
    }

    await sendPushNotification(notificationPayload)
  } catch (err) {
    console.error("Error sending notifications:", err)
  }
}
