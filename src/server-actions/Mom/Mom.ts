"use server"

import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import {
  CreateMom,
  DeleteMom,
  GetMomById,
  GetMomsForSpace,
  UpdateMom
} from "@/src/db/data-access/mom/query"

export interface MomFormData {
  meeting_date: string
  meeting_start_time: string
  meeting_end_time: string
  participants: string[]
  discussion_summary: string
  action_items: { id: string; text: string; done: boolean }[]
}

export const CreateMomAction = CreateServerAction(
  true,
  async (spaceId: string, formData: MomFormData) => {
    try {
      const user = await AuthUserAction()
      const [mom] = await CreateMom({
        ...formData,
        space_id: spaceId,
        created_by: user.unique_id
      })
      return { success: true, data: mom }
    } catch (error) {
      return { success: false, error }
    }
  }
)

export const GetMomsForSpaceAction = CreateServerAction(
  true,
  async (spaceId: string) => {
    try {
      const moms = await GetMomsForSpace(spaceId)
      return { success: true, data: moms }
    } catch (error) {
      return { success: false, error }
    }
  }
)

export const UpdateMomAction = CreateServerAction(
  true,
  async (momId: string, formData: MomFormData) => {
    try {
      const existing = await GetMomById(momId)
      if (!existing) {
        return { success: false, error: "Minutes of meeting not found." }
      }
      const updated = await UpdateMom(momId, formData)
      return { success: true, data: updated }
    } catch (error) {
      return { success: false, error }
    }
  }
)

export const DeleteMomAction = CreateServerAction(
  true,
  async (momId: string) => {
    try {
      const deleted = await DeleteMom(momId)
      return { success: true, data: deleted }
    } catch (error) {
      return { success: false, error }
    }
  }
)
