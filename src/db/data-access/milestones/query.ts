import { asc, eq } from "drizzle-orm"
import { db } from "../.."
import {
  InsertProjectMilestone,
  projectMilestonesTable,
  SelectProjectMilestone
} from "../../schema"

export const GetMilestonesForSpace = async (
  spaceId: string
): Promise<SelectProjectMilestone[]> => {
  return db
    .select()
    .from(projectMilestonesTable)
    .where(eq(projectMilestonesTable.space_id, spaceId))
    .orderBy(asc(projectMilestonesTable.order_index))
}

export const BulkCreateMilestones = async (
  rows: InsertProjectMilestone[]
): Promise<SelectProjectMilestone[]> => {
  return db.insert(projectMilestonesTable).values(rows).returning()
}

export const GetMilestoneById = async (
  id: string
): Promise<SelectProjectMilestone | null> => {
  const [row] = await db
    .select()
    .from(projectMilestonesTable)
    .where(eq(projectMilestonesTable.id, id))
  return row ?? null
}

export const GetMilestoneWithSpace = async (
  id: string
): Promise<{
  milestone: SelectProjectMilestone
  spaceSlug: string | null
  channelSlug: string | null
  spaceName: string
  createdBy: string
} | null> => {
  const row = await db.query.projectMilestonesTable.findFirst({
    where: eq(projectMilestonesTable.id, id),
    with: {
      space: {
        with: {
          channel: true
        }
      }
    }
  })

  if (!row) return null

  const { space, ...milestone } = row
  return {
    milestone: milestone as SelectProjectMilestone,
    spaceSlug: space?.space_slug ?? null,
    channelSlug: space?.channel?.channel_slug ?? null,
    spaceName: space?.space_name ?? "",
    createdBy: space?.created_by ?? ""
  }
}

export const UpdateMilestone = async (
  id: string,
  data: Partial<
    Pick<
      InsertProjectMilestone,
      | "name"
      | "status"
      | "start_date"
      | "end_date"
      | "order_index"
      | "artifacts"
    >
  >
): Promise<SelectProjectMilestone | null> => {
  const [row] = await db
    .update(projectMilestonesTable)
    .set(data)
    .where(eq(projectMilestonesTable.id, id))
    .returning()
  return row ?? null
}

export const DeleteMilestone = async (id: string): Promise<void> => {
  await db
    .delete(projectMilestonesTable)
    .where(eq(projectMilestonesTable.id, id))
}

// ─── Reconfigure transaction ───────────────────────────────────────────────────
// Applies a diff atomically. Status is never touched for existing milestones.

export const ApplyMilestoneDiff = async (diff: {
  spaceId: string
  toCreate: InsertProjectMilestone[]
  toUpdate: {
    id: string
    data: Partial<
      Pick<
        InsertProjectMilestone,
        "name" | "start_date" | "end_date" | "order_index"
      >
    >
  }[]
  toDelete: string[]
}): Promise<SelectProjectMilestone[]> => {
  return db.transaction(async (tx) => {
    for (const id of diff.toDelete) {
      await tx
        .delete(projectMilestonesTable)
        .where(eq(projectMilestonesTable.id, id))
    }

    for (const { id, data } of diff.toUpdate) {
      await tx
        .update(projectMilestonesTable)
        .set(data)
        .where(eq(projectMilestonesTable.id, id))
    }

    if (diff.toCreate.length > 0) {
      await tx.insert(projectMilestonesTable).values(diff.toCreate)
    }

    return tx
      .select()
      .from(projectMilestonesTable)
      .where(eq(projectMilestonesTable.space_id, diff.spaceId))
      .orderBy(asc(projectMilestonesTable.order_index))
  })
}
