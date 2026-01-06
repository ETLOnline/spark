import { SelectProject, SelectProjectUser } from "@/src/db/schema"
import { sendPushNotification } from "../PushNotification.utils"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { SendSystemNotification } from "../../system-notification/SystemNotification.utils"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"
import { getInitials } from "@/src/utils/helpers"

export const SendProjectNotifications = async (
  event_type: string,
  projectUsers: SelectProjectUser[],
  project?: SelectProject
) => {
  try {
    const authUser = await AuthUserAction()

    const notificationPayload = {
      user_id: authUser.unique_id,
      receivers: projectUsers.map((user) => `${user.user_id}`),
      template: {
        title: `Added to Project: ${project?.project_name}`,
        body: `${authUser.first_name} ${authUser.last_name} added you to the project "${project?.project_name}".`,
        deep_link: createAbsoluteUrl(`/project/${project?.id}/board`),
        icon:
          authUser.profile_url ||
          getInitials(`${authUser.first_name} ${authUser.last_name}`)
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
