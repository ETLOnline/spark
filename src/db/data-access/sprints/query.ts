import { and, desc, eq, gte } from "drizzle-orm"
import { db } from "../.."
import { SelectSprint, sprintBurnDownTable, SprintTable } from "../../schema"
import moment from "moment"

export async function CreateSprint(sprintData: SelectSprint) {
  try {
    const sprint = await db.insert(SprintTable).values(sprintData).returning()

    return sprint[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getSprints(projectId: string) {
  try {
    const sprints = await db
      .select()
      .from(SprintTable)
      .where(eq(SprintTable.projectId, projectId))

    return sprints
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function UpdateSprint(
  sprintId: string,
  sprintData: Partial<SelectSprint>
) {
  try {
    const UpdatedSprint = await db
      .update(SprintTable)
      .set(sprintData)
      .where(eq(SprintTable.id, sprintId))
      .returning()

    return UpdatedSprint[0]
  } catch (e: any) {
    throw new Error(e.messege)
  }
}

export async function DeleteSprint(sprintId: string) {
  try {
    const deletedSprint = await db
      .delete(SprintTable)
      .where(eq(SprintTable.id, sprintId))
      .returning()

    return deletedSprint[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function sprintCount(projectId: string) {
  try {
    const sprints = await db.$count(
      SprintTable,
      eq(SprintTable.projectId, projectId)
    )
    return sprints
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function addSprintBurnDown(
  sprintId: string,
  totalTasks: number,
  completedTasks: number,
  totalStoryPoints: number
) {
  try {
    const [burnDown] = await db
      .insert(sprintBurnDownTable)
      .values({
        sprint_id: sprintId,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        total_story_points: totalStoryPoints
      })
      .returning()

    return burnDown
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getSprintBurnDown(sprintId: string) {
  try {
    const burnDown = await db.query.sprintBurnDownTable.findMany({
      where: eq(sprintBurnDownTable.sprint_id, sprintId),
      with: {
        sprint: true,
        task: true
      }
    })

    return burnDown
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const getLatestBurnDown = async (sprintId: string) => {
  try {
    const res = await db.query.sprintBurnDownTable.findFirst({
      where: eq(sprintBurnDownTable.sprint_id, sprintId),
      orderBy: desc(sprintBurnDownTable.created_at)
    })

    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const getRecentlyUpdatedSprints = async () => {
  try {
    const fifteenMinutesAgo = moment()
      .subtract(15, "minutes")
      .format("YYYY-MM-DD HH:mm:ss.SSSSSSZ")

    const res = await db
      .select({ id: SprintTable.id })
      .from(SprintTable)
      .where(
        and(
          gte(SprintTable.updated_at, fifteenMinutesAgo),
          eq(SprintTable.sprint_status, "active")
        )
      )

    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}
