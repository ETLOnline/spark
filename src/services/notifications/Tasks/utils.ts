import { SelectProject, SelectTask } from "@/src/db/schema"
import { sendBeamsNotification } from "../Helper"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"

export const SendTaskNotifications = async (
  event_type: string,
  task: SelectTask,
  project?: SelectProject
) => {
  try {
    const authUser = await AuthUserAction()
    if (!authUser) throw new Error("Unauthorized")

    const isAssignee = authUser.unique_id === task.assign_to
    const isAssignor = authUser.unique_id === task.assign_by

    const updateReceivers = isAssignee
      ? [`user-${task.assign_by}`]
      : isAssignor
        ? [`user-${task.assign_to}`]
        : [`user-${task.assign_to}`, `user-${task.assign_by}`]

    const ctaLink = `project/${task?.project_id}/task/${task?.id}`

    if (event_type === "task_assigned") {
      await sendBeamsNotification({
        receivers: [`user-${task?.assign_to}`],

        template: {
          title: `New Task Assigned: ${task?.task_num}`,
          body: `You have been assigned a new task in project "${project?.project_name}".`,
          deep_link: `${process.env.NEXT_PUBLIC_BASE_URL}/${ctaLink}`
        }
      })
    } else if (event_type === "task_updated") {
      await sendBeamsNotification({
        receivers: updateReceivers,

        template: {
          title: `Task Updated`,
          body: `${authUser.first_name} ${authUser.last_name} updated the task ${task?.task_num}.`,
          deep_link: `${process.env.NEXT_PUBLIC_BASE_URL}/${ctaLink}`,
          icon: authUser.profile_url || ""
        }
      })
    } else if (event_type === "task_commented") {
      await sendBeamsNotification({
        receivers: updateReceivers,

        template: {
          title: `New Comment on Task: ${task?.task_num}`,
          body: `${authUser.first_name} ${authUser.last_name} commented on the task "${task?.task_num}".`,
          deep_link: `${process.env.NEXT_PUBLIC_BASE_URL}/${ctaLink}`,
          icon: authUser.profile_url || ""
        }
      })
    }
  } catch (error) {
    console.error("Error sending notifications:", error)
  }
}
