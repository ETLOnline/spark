import { SelectUserContact } from "@/src/db/schema"
import { NotificationPayload, sendBeamsNotification } from "../Helper"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"

export const SendConnectionsotification = async (
  event_type: string,
  connection: SelectUserContact
) => {
  try {
    const authUser = await AuthUserAction()

    const notificationPayload: NotificationPayload = {
      receivers: [`user-${connection.contact_id}`],
      template: {
        title: "New Connection Request",
        body: `${authUser.first_name} ${authUser.last_name} sent you a connection request.`,
        icon: authUser.profile_url || "",
        deep_link: `${process.env.NEXT_PUBLIC_BASE_URL}/connections`
      }
    }

    switch (event_type) {
      case "connection_request":
        notificationPayload.template.title = "New Connection Request"
        notificationPayload.template.body = `${authUser.first_name} ${authUser.last_name} sent you a connection request.`
        break
      case "connection_accepted":
        notificationPayload.template.title = "Connection Request Accepted"
        notificationPayload.template.body = `${authUser.first_name} ${authUser.last_name}  has accepted your connection request. You’re now connected.`
        break
      default:
        break
    }

    await sendBeamsNotification(notificationPayload)
  } catch (err) {
    console.error("Error sending notifications:", err)
  }
}
