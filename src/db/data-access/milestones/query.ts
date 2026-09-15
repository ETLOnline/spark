import { asc, count, eq } from "drizzle-orm"
import { db } from "../.."
import {
  InsertFypMilestone,
  InsertFypArtifactFile,
  fypMilestonesTable,
  fypArtifactFilesTable,
  SelectFypMilestone,
  SelectFypArtifactFile,
  SelectFile
} from "../../schema"


export type RawMilestoneArtifact = SelectFypArtifactFile & {
  file: SelectFile | null
}
export type RawMilestoneWithArtifacts = SelectFypMilestone & {
  artifacts: RawMilestoneArtifact[]
}

export const GetMilestonesForSpace = async (
  spaceId: string
): Promise<RawMilestoneWithArtifacts[]> => {
  return db.query.fypMilestonesTable.findMany({
    where: eq(fypMilestonesTable.space_id, spaceId),
    orderBy: [asc(fypMilestonesTable.order_index)],
    with: { artifacts: { with: { file: true } } }
  })
}

export const BulkCreateMilestones = async (
  rows: InsertFypMilestone[]
): Promise<SelectFypMilestone[]> => {
  return db.insert(fypMilestonesTable).values(rows).returning()
}

export const GetMilestoneById = async (
  id: string
): Promise<RawMilestoneWithArtifacts | null> => {
  const row = await db.query.fypMilestonesTable.findFirst({
    where: eq(fypMilestonesTable.id, id),
    with: { artifacts: { with: { file: true } } }
  })
  return row ?? null
}

export const GetMilestoneWithSpace = async (
  id: string
): Promise<{
  milestone: RawMilestoneWithArtifacts
  spaceSlug: string | null
  channelSlug: string | null
  spaceName: string
  createdBy: string
} | null> => {
  const row = await db.query.fypMilestonesTable.findFirst({
    where: eq(fypMilestonesTable.id, id),
    with: {
      artifacts: { with: { file: true } },
      space: { with: { channel: true } }
    }
  })

  if (!row) return null

  const { space, ...milestone } = row
  return {
    milestone,
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
      "name" | "status" | "start_date" | "end_date" | "order_index"
    >
  >
): Promise<RawMilestoneWithArtifacts | null> => {
  const [row] = await db
    .update(fypMilestonesTable)
    .set(data)
    .where(eq(fypMilestonesTable.id, id))
    .returning()
  if (!row) return null
  return GetMilestoneById(id)
}

export const DeleteMilestone = async (id: string): Promise<void> => {
  await db.delete(fypMilestonesTable).where(eq(fypMilestonesTable.id, id))
}

// ─── Artifacts ──────────────────────────────────────────────────────────────────

export const AddMilestoneArtifact = async (
  data: InsertFypArtifactFile
): Promise<void> => {
  await db.insert(fypArtifactFilesTable).values(data)
}

export const DeleteMilestoneArtifact = async (
  artifactId: number
): Promise<void> => {
  await db
    .delete(fypArtifactFilesTable)
    .where(eq(fypArtifactFilesTable.id, artifactId))
}

export const CountMilestoneArtifacts = async (
  milestoneId: string
): Promise<number> => {
  const [row] = await db
    .select({ value: count() })
    .from(fypArtifactFilesTable)
    .where(eq(fypArtifactFilesTable.milestone_id, milestoneId))
  return row?.value ?? 0
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
}): Promise<RawMilestoneWithArtifacts[]> => {
  await db.transaction(async (tx) => {
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
  })

  return GetMilestonesForSpace(diff.spaceId)
}
