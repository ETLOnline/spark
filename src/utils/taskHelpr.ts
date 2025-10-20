import { addProjectRecentActivities } from "../db/data-access/project-management/query"
import { InsertProjectRecentActivity, SelectTask } from "../db/schema"
import { AuthUserAction } from "../server-actions/User/AuthUserAction"

export const addProjectRecentActivity = async (
  activity_type: string,
  payLoad: SelectTask
) => {
  try {
    if (!payLoad.project_id) return null

    const user = await AuthUserAction()

    const newActivity: InsertProjectRecentActivity = {
      project_id: payLoad.project_id,
      icon: "",
      activity: "",
      deep_link: `/project/${payLoad.project_id}/task/${payLoad.id}`
    }

    switch (activity_type) {
      case "task_created":
        newActivity.icon = user.profile_url || ""
        newActivity.activity = `${user.first_name} ${user.last_name} created task ${payLoad.task_num}`
        break

      case "task_updated":
        newActivity.icon = user.profile_url || ""
        newActivity.activity = `${user.first_name} ${user.last_name} updated task ${payLoad.task_num}`
        break

      case "task_commented":
        newActivity.icon = user.profile_url || ""
        newActivity.activity = `${user.first_name} ${user.last_name} commented on task ${payLoad.task_num}`
        break

      default:
        return null
    }

    await addProjectRecentActivities(newActivity)
  } catch (error: any) {
    console.error(`Failed to add recent activity: ${error.message}`)
  }
}
