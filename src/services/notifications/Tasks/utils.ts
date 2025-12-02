import { SelectProject, SelectTask, SelectTaskComment } from "@/src/db/schema"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import {
  NotificationPayload,
  sendPushNotification
} from "../PushNotification.utils"
import { SendSystemNotification } from "../../system-notification/SystemNotification.utils"
import { NotificationEvent } from "@/src/services/notify/types/events"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"
import { formatContent } from "@/src/utils/helpers"
import { extractMentionsFromMessage } from "../../realtime/utils/helper"
import { getTaskCommentsByTaskId } from "@/src/db/data-access/tasks/query"

export const SendTaskNotifications = async (
  event_type: string,
  task: SelectTask,
  project?: SelectProject,
  Comment?: SelectTaskComment | null
) => {
  try {
    const authUser = await AuthUserAction()

    const formatComment = formatContent(Comment?.content || "")

    const mentionedUsers = extractMentionsFromMessage(formatComment)

    const taskComments = await getTaskCommentsByTaskId(task.id)

    const commentAuthors = taskComments.map((c) => c.user_id) || []
    const commentMentionedUsers =
      taskComments.flatMap((c) => c.mentions || []).filter(Boolean) || []

    const allCommentRelatedUsers = [
      ...new Set([...commentAuthors, ...commentMentionedUsers])
    ]

    const isAssignee = authUser.unique_id === task.assign_to
    const isAssignor = authUser.unique_id === task.assign_by

    const updateReceivers = isAssignee
      ? [`${task.assign_by}`]
      : isAssignor
        ? [`${task.assign_to}`]
        : [`${task.assign_to}`, `${task.assign_by}`]

    const finalRecivers = [
      ...new Set([...updateReceivers, ...allCommentRelatedUsers])
    ].filter((id) => id !== authUser.unique_id)

    const ctaLink = `${process.env.NEXT_PUBLIC_BASE_URL}/project/${task?.project_id}/task/${task?.id}`

    const notificationPayload: NotificationPayload = {
      receivers: [],
      template: {
        title: "",
        body: "",
        deep_link: createAbsoluteUrl(ctaLink),
        icon: authUser.profile_url || ""
      }
    }

    switch (event_type) {
      case NotificationEvent.TASK_ASSIGNED:
        notificationPayload.receivers = [`${task?.assign_to}`]
        notificationPayload.template.title = `New Task Assigned: ${task?.task_num}`
        notificationPayload.template.body = `You have been assigned a new task in project "${project?.project_name}".`
        break

      case NotificationEvent.UPDATE_TASK:
        notificationPayload.receivers = finalRecivers
        notificationPayload.template.title = "Task Updated"
        notificationPayload.template.body = `${authUser.first_name} ${authUser.last_name} updated the task ${task?.task_num}.`
        break

      case NotificationEvent.TASK_COMMENTED:
        notificationPayload.receivers = finalRecivers
        notificationPayload.template.title = `New Comment on Task: ${task?.task_num}`
        notificationPayload.template.body = `${authUser.first_name} ${authUser.last_name} commented on the task "${task?.task_num}".`
        break

      default:
        return // no notification for unknown event type
    }

    await sendPushNotification(notificationPayload)
    await SendSystemNotification({
      ...notificationPayload,
      user_id: authUser.unique_id
    })

    if (mentionedUsers.length > 0) {
      const notificationPayload: NotificationPayload = {
        receivers: mentionedUsers,
        template: {
          title: `You were mentioned in a comment on Task: ${task?.task_num}`,
          body: `${authUser.first_name} ${authUser.last_name} mentioned you in a comment on the task "${task?.task_num}".`,
          deep_link: createAbsoluteUrl(ctaLink),
          icon: authUser.profile_url || ""
        }
      }
      await sendPushNotification(notificationPayload)
      await SendSystemNotification({
        ...notificationPayload,
        user_id: authUser.unique_id
      })
    }
  } catch (error) {
    console.error("Error sending notifications:", error)
  }
}
