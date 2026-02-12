"use server"
import {
  addSprintBurnDown,
  CreateSprint,
  DeleteSprint,
  getSprintBurnDown,
  getSprints,
  isSprintSlugAvailable,
  sprintCount,
  sprintQueryFilters,
  UpdateSprint
} from "@/src/db/data-access/sprints/query"
import { CreateServerAction } from ".."
import { SelectSprint } from "@/src/db/schema"
import pusherServer from "@/src/services/realtime/pusherServer"
import { GetTasks } from "@/src/db/data-access/tasks/query"
import { AuthUserAction } from "../User/AuthUserAction"

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

export const IsSprintSlugAvailableAction = CreateServerAction(
  true,
  async (slug: string, projectId: string) => {
    try {
      const slugAvailable = await isSprintSlugAvailable(slug, projectId)
      return { success: true, data: slugAvailable }
    } catch (error) {
      return { error: error }
    }
  }
)
