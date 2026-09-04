import { asc, eq } from "drizzle-orm"
import { db } from "../.."
import {
  InsertFypMilestone,
  fypMilestonesTable,
  SelectFypMilestone
} from "../../schema"

export const GetMilestonesForSpace = async (
  spaceId: string
): Promise<SelectFypMilestone[]> => {
  return db
    .select()
    .from(fypMilestonesTable)
    .where(eq(fypMilestonesTable.space_id, spaceId))
    .orderBy(asc(fypMilestonesTable.order_index))
}

export const BulkCreateMilestones = async (
  rows: InsertFypMilestone[]
): Promise<SelectFypMilestone[]> => {
  return db.insert(fypMilestonesTable).values(rows).returning()
}

export const GetMilestoneById = async (
  id: string
): Promise<SelectFypMilestone | null> => {
  const [row] = await db
    .select()
    .from(fypMilestonesTable)
    .where(eq(fypMilestonesTable.id, id))
  return row ?? null
}

export const GetMilestoneWithSpace = async (
  id: string
): Promise<{
  milestone: SelectFypMilestone
  spaceSlug: string | null
  channelSlug: string | null
  spaceName: string
  createdBy: string
} | null> => {
  const row = await db.query.fypMilestonesTable.findFirst({
    where: eq(fypMilestonesTable.id, id),
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
    milestone: milestone as SelectFypMilestone,
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
      InsertFypMilestone,
      | "name"
      | "status"
      | "start_date"
      | "end_date"
      | "order_index"
      | "artifacts"
    >
  >
): Promise<SelectFypMilestone | null> => {
  const [row] = await db
    .update(fypMilestonesTable)
    .set(data)
    .where(eq(fypMilestonesTable.id, id))
    .returning()
  return row ?? null
}

export const DeleteMilestone = async (id: string): Promise<void> => {
  await db.delete(fypMilestonesTable).where(eq(fypMilestonesTable.id, id))
}

// ─── Reconfigure transaction ───────────────────────────────────────────────────
// Applies a diff atomically. Status is never touched for existing milestones.

export const ApplyMilestoneDiff = async (diff: {
  spaceId: string
  toCreate: InsertFypMilestone[]
  toUpdate: {
    id: string
    data: Partial<
      Pick<
        InsertFypMilestone,
        "name" | "start_date" | "end_date" | "order_index"
      >
    >
  }[]
  toDelete: string[]
}): Promise<SelectFypMilestone[]> => {
  return db.transaction(async (tx) => {
    for (const id of diff.toDelete) {
      await tx.delete(fypMilestonesTable).where(eq(fypMilestonesTable.id, id))
    }

    for (const { id, data } of diff.toUpdate) {
      await tx
        .update(fypMilestonesTable)
        .set(data)
        .where(eq(fypMilestonesTable.id, id))
    }

    if (diff.toCreate.length > 0) {
      await tx.insert(fypMilestonesTable).values(diff.toCreate)
    }

    return tx
      .select()
      .from(fypMilestonesTable)
      .where(eq(fypMilestonesTable.space_id, diff.spaceId))
      .orderBy(asc(fypMilestonesTable.order_index))
  })
}
