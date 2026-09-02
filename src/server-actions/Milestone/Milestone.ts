"use server"

import { CreateServerAction } from ".."
import { AuthUserAction } from "../User/AuthUserAction"
import {
  ApplyMilestoneDiff,
  BulkCreateMilestones,
  DeleteMilestone,
  GetMilestonesForSpace,
  UpdateMilestone
} from "@/src/db/data-access/milestones/query"
import { InsertProjectMilestone, MilestoneStatus } from "@/src/db/schema"

// ─── Get milestones ───────────────────────────────────────────────────────────

export const GetMilestonesForSpaceAction = CreateServerAction(
  true,
  async (spaceId: string) => {
    try {
      const milestones = await GetMilestonesForSpace(spaceId)
      return { success: true, data: milestones }
    } catch (error) {
      return { error: error }
    }
  }
)

// ─── First-time setup ─────────────────────────────────────────────────────────
// Only called when there are no milestones yet. Bulk inserts all as INCOMPLETE.

export interface MilestoneInput {
  name: string
  start_date?: string
  end_date?: string
  order_index: number
}

export const SetupMilestonesAction = CreateServerAction(
  true,
  async (spaceId: string, inputs: MilestoneInput[]) => {
    try {
      const user = await AuthUserAction()
      if (!user) return { success: false, message: "Unauthorized" }

      const rows: InsertProjectMilestone[] = inputs.map((m) => ({
        space_id: spaceId,
        name: m.name,
        status: MilestoneStatus.INCOMPLETE,
        start_date: m.start_date ?? null,
        end_date: m.end_date ?? null,
        order_index: m.order_index,
        created_by: user.unique_id
      }))

      const created = await BulkCreateMilestones(rows)
      return { success: true, data: created }
    } catch (error) {
      return { error: error }
    }
  }
)

// ─── Reconfigure ──────────────────────────────────────────────────────────────
// Diffs the new configuration against current DB state and applies only the
// necessary creates / updates / deletes in a single transaction.
// Existing milestone statuses and student progress are preserved.

export interface ReconfigureInput {
  id?: string // DB id for existing milestones; absent for newly added rows
  name: string
  start_date?: string
  end_date?: string
  order_index: number
}

export const ReconfigureMilestonesAction = CreateServerAction(
  true,
  async (spaceId: string, inputs: ReconfigureInput[]) => {
    try {
      const user = await AuthUserAction()
      if (!user) return { success: false, message: "Unauthorized" }

      const current = await GetMilestonesForSpace(spaceId)
      const currentIds = new Set(current.map((m) => m.id))
      const keptIds = new Set(inputs.filter((i) => i.id).map((i) => i.id!))

      // Milestones removed from the list
      const toDelete = current
        .filter((m) => !keptIds.has(m.id))
        .map((m) => m.id)

      // Existing milestones — update name / dates / order only; status preserved
      const toUpdate = inputs
        .filter((i) => i.id && currentIds.has(i.id))
        .map((i) => ({
          id: i.id!,
          data: {
            name: i.name,
            start_date: i.start_date ?? null,
            end_date: i.end_date ?? null,
            order_index: i.order_index
          }
        }))

      // New milestones — always start as INCOMPLETE
      const toCreate: InsertProjectMilestone[] = inputs
        .filter((i) => !i.id)
        .map((m) => ({
          space_id: spaceId,
          name: m.name,
          status: MilestoneStatus.INCOMPLETE,
          start_date: m.start_date ?? null,
          end_date: m.end_date ?? null,
          order_index: m.order_index,
          created_by: user.unique_id
        }))

      const milestones = await ApplyMilestoneDiff({
        spaceId,
        toCreate,
        toUpdate,
        toDelete
      })

      return { success: true, data: milestones }
    } catch (error) {
      return { error: error }
    }
  }
)

// ─── Update a milestone ────────────────────────────────────────────────────────

export const UpdateMilestoneAction = CreateServerAction(
  true,
  async (
    id: string,
    data: {
      name?: string
      status?: string
      start_date?: string
      end_date?: string
      order_index?: number
    }
  ) => {
    try {
      const updated = await UpdateMilestone(id, data)
      return { success: true, data: updated }
    } catch (error) {
      return { error: error }
    }
  }
)

// ─── Delete a milestone ────────────────────────────────────────────────────────

export const DeleteMilestoneAction = CreateServerAction(
  true,
  async (id: string) => {
    try {
      await DeleteMilestone(id)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)
