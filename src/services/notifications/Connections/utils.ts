import { SelectUserContact } from "@/src/db/schema"
import { sendBeamsNotification } from "../Helper"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"

export const SendConnectionsotification = async (
  event_type: string,
  connection: SelectUserContact
) => {
  try {
    const authUser = await AuthUserAction()

    if (!authUser) throw new Error("Unauthorized")

    if (event_type === "connection_request") {
      await sendBeamsNotification({
        receivers: [`user-${connection.contact_id}`],
        template: {
          title: "New Connection Request",
          body: `${authUser.first_name} ${authUser.last_name} sent you a connection request.`,
          icon: authUser.profile_url || "",
          deep_link: `${process.env.NEXT_PUBLIC_BASE_URL}/connections`
        }
      })
    } else if (event_type === "connection_accepted") {
      await sendBeamsNotification({
        receivers: [`user-${connection.user_id}`],
        template: {
          title: "Connection Accepted",
          body: `${authUser.first_name} ${authUser.last_name}  has accepted your connection request. You’re now connected.`,
          icon: authUser.profile_url || "",
          deep_link: `${process.env.NEXT_PUBLIC_BASE_URL}/connections`
        }
      })
    }
  } catch (err) {
    console.error("Error sending notifications:", err)
  }
}
