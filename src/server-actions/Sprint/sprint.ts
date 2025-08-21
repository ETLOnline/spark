"use server"
import {
  CreateSprint,
  DeleteSprint,
  getSprints,
  UpdateSprint
} from "@/src/db/data-access/sprints/query"
import { CreateServerAction } from ".."
import { SelectSprint } from "@/src/db/schema"

export const CreateSprintAction = CreateServerAction(
  true,
  async (sprintData: SelectSprint) => {
    try {
      const sprint = await CreateSprint(sprintData)

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
  async (SprintId: string, sprintDataL: Partial<SelectSprint>) => {
    try {
      const updatedSprint = await UpdateSprint(SprintId, sprintDataL)

      return { success: true, data: updatedSprint }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DeleteSprintAction = CreateServerAction(
  true,
  async (sprintId: string) => {
    try {
      const deletedSprint = await DeleteSprint(sprintId)

      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)
