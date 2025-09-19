import { SelectProject, SelectTask } from "@/src/db/schema"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import {
  NotificationPayload,
  sendPushNotification
} from "../PushNotification.utils"

export const SendTaskNotifications = async (
  event_type: string,
  task: SelectTask,
  project?: SelectProject
) => {
  try {
    const authUser = await AuthUserAction()

    const isAssignee = authUser.unique_id === task.assign_to
    const isAssignor = authUser.unique_id === task.assign_by

    const updateReceivers = isAssignee
      ? [`${task.assign_by}`]
      : isAssignor
        ? [`${task.assign_to}`]
        : [`${task.assign_to}`, `${task.assign_by}`]

    const ctaLink = `${process.env.NEXT_PUBLIC_BASE_URL}/project/${task?.project_id}/task/${task?.id}`

    const notificationPayload: NotificationPayload = {
      receivers: [],
      template: {
        title: "",
        body: "",
        deep_link: ctaLink,
        icon: authUser.profile_url || ""
      }
    }

    switch (event_type) {
      case "task_assigned":
        notificationPayload.receivers = [`${task?.assign_to}`]
        notificationPayload.template.title = `New Task Assigned: ${task?.task_num}`
        notificationPayload.template.body = `You have been assigned a new task in project "${project?.project_name}".`
        break

      case "task_updated":
        notificationPayload.receivers = updateReceivers
        notificationPayload.template.title = "Task Updated"
        notificationPayload.template.body = `${authUser.first_name} ${authUser.last_name} updated the task ${task?.task_num}.`
        break

      case "task_commented":
        notificationPayload.receivers = updateReceivers
        notificationPayload.template.title = `New Comment on Task: ${task?.task_num}`
        notificationPayload.template.body = `${authUser.first_name} ${authUser.last_name} commented on the task "${task?.task_num}".`
        break

      default:
        return // no notification for unknown event type
    }

    await sendPushNotification(notificationPayload)
  } catch (error) {
    console.error("Error sending notifications:", error)
  }
}
