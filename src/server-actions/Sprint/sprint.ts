"use server"
import {
  addSprintBurnDown,
  CreateSprint,
  DeleteSprint,
  getSprintBurnDown,
  getSprints,
  sprintCount,
  sprintQueryFilters,
  UpdateSprint
} from "@/src/db/data-access/sprints/query"
import { CreateServerAction } from ".."
import { SelectSprint } from "@/src/db/schema"
import pusherServer from "@/src/services/realtime/pusherServer"
import { GetTasks } from "@/src/db/data-access/tasks/query"
import { AuthUserAction } from "../User/AuthUserAction"
import { AddRewardAction } from "../Reward/Reward"
import { ActivityTypes } from "@/src/types/Rewards/rewards"
import { SprintStatus } from "@/src/components/Dashboard/ProjectManagement/constants/projectManagment"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"
import { getProjectById } from "@/src/db/data-access/project-management/query"

export const CreateSprintAction = CreateServerAction(
  true,
  async (sprintData: SelectSprint, page_name?: string) => {
    try {
      const sprint = await CreateSprint(sprintData)

      pusherServer.trigger(
        `project-${sprint.projectId}-sprints`,
        "sprint-add",
        sprint
      )
      const sprintUrl = createAbsoluteUrl(`/project/${sprint.projectId}/sprint`)
      const user = await AuthUserAction()
      if (user?.unique_id) {
        await AddRewardAction(
          ActivityTypes.SprintCreation,
          user.unique_id,
          sprintUrl,
          { sprint_id: sprint.id, project_id: sprint.projectId }
        )
      }

      return { success: true, data: sprint }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSprintAction = CreateServerAction(
  true,
  async (filters?: sprintQueryFilters) => {
    try {
      const sprints = await getSprints({ ...filters })
      return { success: true, data: sprints }
    } catch (error) {
      return { error: error }
    }
  }
)

export const UpdateSprintAction = CreateServerAction(
  true,
  async (
    SprintId: string,
    sprintData: Partial<SelectSprint>,
    page_name?: string
  ) => {
    try {
      const updatedSprint = await UpdateSprint(SprintId, sprintData)
      const user = await AuthUserAction()

      pusherServer.trigger(
        `project-${updatedSprint.projectId}-sprints`,
        "sprint-edit",
        updatedSprint
      )
      const sprintUrl = createAbsoluteUrl(
        `/project/${updatedSprint.projectId}/sprint`
      )

      if (updatedSprint.sprint_status === SprintStatus.CLOSED) {
        if (user?.unique_id) {
          const project = await getProjectById(updatedSprint.projectId, true)
          const communityId = project?.channel?.community_id

          await AddRewardAction(
            ActivityTypes.SprintCompletion,
            user.unique_id,
            sprintUrl,
            {
              sprint_id: updatedSprint.id,
              project_id: updatedSprint.projectId,
              community_id: communityId
            },
            undefined,
            "sprint_id",
            updatedSprint.id
          )
        }
      }

      return { success: true, data: updatedSprint }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DeleteSprintAction = CreateServerAction(
  true,
  async (sprintId: string, page_name?: string) => {
    try {
      const deletedSprint = await DeleteSprint(sprintId)

      pusherServer.trigger(
        `project-${deletedSprint.projectId}-sprints`,
        "sprint-delete",
        deletedSprint
      )

      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSprintCountAction = CreateServerAction(
  true,
  async (projectId: string) => {
    try {
      const sprints = await sprintCount(projectId)
      return { success: true, data: sprints }
    } catch (error) {
      return { error: error }
    }
  }
)

export const getSprintBurnDownAction = CreateServerAction(
  true,
  async (sprintId: string) => {
    try {
      const sprint = await getSprintBurnDown(sprintId)
      return { success: true, data: sprint }
    } catch (error) {
      return { error: error }
    }
  }
)
