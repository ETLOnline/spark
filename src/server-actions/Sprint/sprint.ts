"use server"
import {
  CreateSprint,
  DeleteSprint,
  getSprints,
  sprintCount,
  UpdateSprint
} from "@/src/db/data-access/sprints/query"
import { CreateServerAction } from ".."
import { SelectSprint } from "@/src/db/schema"
import pusherServer from "@/src/services/realtime/pusherServer"

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

      return { success: true, data: sprint }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSprintAction = CreateServerAction(
  true,
  async (projectId: string) => {
    try {
      const sprints = await getSprints(projectId)

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

      pusherServer.trigger(
        `project-${updatedSprint.projectId}-sprints`,
        "sprint-edit",
        updatedSprint
      )

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
