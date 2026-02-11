import { and, desc, eq, gte, inArray, SQLWrapper } from "drizzle-orm"
import { db } from "../.."
import { SelectSprint, sprintBurnDownTable, SprintTable } from "../../schema"
import moment from "moment"
import { SprintStatus } from "@/src/components/Dashboard/ProjectManagement/constants/projectManagment"

export type sprintQueryFilters = {
  page?: number
  limit?: number
  projectId?: string
  status?: string[]
}

export async function CreateSprint(sprintData: SelectSprint) {
  try {
    const sprint = await db.insert(SprintTable).values(sprintData).returning()

    return sprint[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getSprints(filters?: sprintQueryFilters) {
  try {
    const page = filters?.page
    const limit = filters?.limit
    const offset = page && limit ? (page - 1) * limit : 0

    const whereClauses: (SQLWrapper | undefined)[] = []

    if (filters) {
      if (filters.projectId) {
        whereClauses.push(eq(SprintTable.projectId, filters.projectId))
      }

      if (filters.status && filters.status.length > 0) {
        whereClauses.push(inArray(SprintTable.sprint_status, filters.status))
      }
    }

    const sprints = await db.query.SprintTable.findMany({
      limit: limit,
      offset: offset,
      where: whereClauses.length ? and(...whereClauses) : undefined
    })

    const totalCount = await db.$count(
      SprintTable,
      whereClauses.length ? and(...whereClauses) : undefined
    )

    return {
      sprints,
      pagination: {
        total: Number(totalCount),
        page: page || 1,
        limit: limit || 0,
        totalPages:
          limit && limit !== 0 ? Math.ceil(Number(totalCount) / limit) : 1
      }
    }
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
          eq(SprintTable.sprint_status, SprintStatus.ACTIVE)
        )
      )

    return res
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export const isSprintSlugAvailable = async (
  slug: string,
  projectId: string
) => {
  try {
    const sprintWithSlug = await db
      .select()
      .from(SprintTable)
      .where(
        and(eq(SprintTable.slug, slug), eq(SprintTable.projectId, projectId))
      )
    return !sprintWithSlug.length
  } catch (e: any) {
    throw new Error(e.message)
  }
}
