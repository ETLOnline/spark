import { ProjectStatus } from "@/src/components/Dashboard/ProjectManagement/types/projectStatus.type"
import { TaskType } from "@/src/components/Dashboard/ProjectManagement/constants/projectManagment"
import {
  addSprintBurnDown,
  getLatestBurnDown,
  getRecentlyUpdatedSprints
} from "@/src/db/data-access/sprints/query"
import { GetTasks } from "@/src/db/data-access/tasks/query"

export async function POST(req: Request) {
  try {
    const sprintsWithRecentUpdates = await getRecentlyUpdatedSprints()

    const affectedSprints = []

    for (const sprint of sprintsWithRecentUpdates) {
      const Tasks = await GetTasks({
        sprint_id: String(sprint.id),
        excludedTypes: [TaskType.EPIC]
      })

      const sprintTasks = Tasks.tasks.filter(
        (task) =>
          task.task_type !== TaskType.EPIC &&
          task.task_type !== TaskType.SUBTASK
      )
      const totalTasks = sprintTasks.length
      const completedTasks = sprintTasks.filter(
        (t) => t.status?.status_slug === ProjectStatus.Done
      ).length

      const storyPointTasks = Tasks.tasks.filter(
        (task) =>
          task.task_type === TaskType.STORY ||
          task.task_type === TaskType.FEATURE
      )
      const totalStoryPoints = storyPointTasks.reduce(
        (sum, t) => sum + Number(t.story_points || 0),
        0
      )

      const completedStoryPoints = storyPointTasks
        .filter((t) => t.status?.status_slug === ProjectStatus.Done)
        .reduce((sum, t) => sum + Number(t.story_points || 0), 0)

      const remainingStoryPoints = totalStoryPoints - completedStoryPoints

      const lastBurnDown = await getLatestBurnDown(String(sprint.id))

      if (!lastBurnDown) {
        await addSprintBurnDown(
          String(sprint.id),
          totalTasks,
          completedTasks,
          remainingStoryPoints
        )
        affectedSprints.push(sprint.id)
        continue
      }

      const hasChanged =
        lastBurnDown?.total_tasks !== totalTasks ||
        lastBurnDown?.completed_tasks !== completedTasks ||
        lastBurnDown?.total_story_points !== remainingStoryPoints

      if (hasChanged) {
        await addSprintBurnDown(
          String(sprint.id),
          totalTasks,
          completedTasks,
          remainingStoryPoints
        )
        affectedSprints.push(sprint.id)
      }
    }

    return Response.json({ success: true, affectedSprints })
  } catch (err) {
    console.error("Error updating sprint burn down:", err)
    return new Response("Error occurred", { status: 500 })
  }
}
