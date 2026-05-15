import { and, desc, eq, ilike, inArray, or, sql, SQLWrapper } from "drizzle-orm"
import { db } from "../.."
import {
  channelsTable,
  InsertProject,
  InsertProjectRecentActivity,
  projectRecentActivityTable,
  projectTable,
  ProjectUsersTable,
  SelectProject,
  spacesTable,
  usersTable
} from "../../schema"

export async function CreateProject(project_data: InsertProject) {
  try {
    const project = await db
      .insert(projectTable)
      .values(project_data)
      .returning()
    return project[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getProjects(spaceId: string) {
  try {
    const projects = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.space_id, spaceId))
    return projects
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getProjectById(
  projectId: string,
  withRelations: boolean = false
): Promise<SelectProject | null> {
  try {
    const project = await db.query.projectTable.findFirst({
      where: eq(projectTable.id, projectId),
      with: withRelations
        ? {
            channel: true,
            space: true
          }
        : undefined
    })

    return project || null
  } catch (error: unknown) {
    console.error(`Failed to fetch project with ID ${projectId}:`, error)
    throw new Error(`Could not retrieve project. An unexpected error occurred.`)
  }
}

export async function createProjectUser(
  projectId: string,
  userId: string,
  role: string = "member"
) {
  try {
    const newProjectUser = await db
      .insert(ProjectUsersTable)
      .values({
        project_id: projectId,
        user_id: userId,
        role
      })
      .returning()
    return newProjectUser[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getExistingProjectUsers(
  projectId: string,
  userIdsToCheck: string[]
): Promise<string[]> {
  try {
    if (userIdsToCheck.length === 0) {
      console.warn("No user IDs provided to check for existing project users.")
      return []
    }

    const existingUsers = await db
      .select({ userId: ProjectUsersTable.user_id })
      .from(ProjectUsersTable)
      .where(
        and(
          eq(ProjectUsersTable.project_id, projectId),
          inArray(ProjectUsersTable.user_id, userIdsToCheck)
        )
      )

    const existingUserIds = existingUsers.map((user) => user.userId)

    return existingUserIds
  } catch (e: any) {
    throw new Error(`Failed to retrieve existing project users: ${e.message}`)
  }
}

export async function createProjectUsers(
  projectId: string,
  usersWithRoles: { userId: string; role: string }[]
) {
  try {
    if (usersWithRoles.length === 0) {
      console.log("No new users provided for project creation.")
      return []
    }

    const projectUsersToInsert = usersWithRoles.map((user) => ({
      project_id: projectId,
      user_id: user.userId,
      role: user.role
    }))

    const newProjectUsers = await db
      .insert(ProjectUsersTable)
      .values(projectUsersToInsert)
      .returning()

    return newProjectUsers
  } catch (e: any) {
    console.error(`Error creating project users: ${e.message}`)
    throw new Error(`Failed to create project users: ${e.message}`)
  }
}
export async function getProjectUsers(
  projectId: string,
  filters?: {
    limit?: number
    search?: string
  }
) {
  try {
    const limit = filters?.limit
    const search = filters?.search

    const whereClauses: (SQLWrapper | undefined)[] = []

    whereClauses.push(eq(ProjectUsersTable.project_id, projectId))

    if (search) {
      const searchedUsers = db
        .select({ id: usersTable.unique_id })
        .from(usersTable)
        .where(
          ilike(
            sql`${usersTable.first_name} || ' ' || ${usersTable.last_name}`,
            `%${search}%`
          )
        )

      whereClauses.push(inArray(ProjectUsersTable.user_id, searchedUsers))
    }

    const projectUsers = await db.query.ProjectUsersTable.findMany({
      limit,
      where: whereClauses.length ? and(...whereClauses) : undefined,
      with: {
        user: true
      }
    })

    return projectUsers
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function getProjectusersProfileUrl(
  projectId: string,
  limit?: number,
  isRendom?: boolean
) {
  try {
    const usersProfileUrls = await db.query.ProjectUsersTable.findMany({
      with: {
        user: {
          columns: {
            profile_url: true
          }
        }
      },
      where: eq(ProjectUsersTable.project_id, projectId),
      limit: limit,
      orderBy: isRendom ? sql`random()` : undefined
    })

    return usersProfileUrls.map((user) => user.user.profile_url)
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function removeProjectUser(projectId: string, userId: string) {
  try {
    const result = await db
      .delete(ProjectUsersTable)
      .where(
        and(
          eq(ProjectUsersTable.project_id, projectId),
          eq(ProjectUsersTable.user_id, userId)
        )
      )
      .returning()
    return result.length > 0
  } catch (error: any) {
    throw new Error(error.message)
  }
}
export async function updateProject(project_data: Partial<InsertProject>) {
  try {
    if (!project_data.id) {
      throw new Error("Project ID is required for update.")
    }

    const updatedProject = await db
      .update(projectTable)
      .set(project_data)
      .where(eq(projectTable.id, project_data.id))
      .returning()

    return updatedProject[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}
export async function updateProjectUserRole(
  projectId: string,
  userId: string,
  role: string
) {
  try {
    const result = await db
      .update(ProjectUsersTable)
      .set({ role })
      .where(
        and(
          eq(ProjectUsersTable.project_id, projectId),
          eq(ProjectUsersTable.user_id, userId)
        )
      )
      .returning()

    return result[0]
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function countProjectMembers(projectId: string) {
  try {
    const count = await db.$count(
      ProjectUsersTable,
      eq(ProjectUsersTable.project_id, projectId)
    )
    return count
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function getProjectsBySpaceIds(spaceIds: string[]) {
  try {
    if (spaceIds.length === 0) {
      console.warn("No space IDs provided to retrieve projects.")
      return []
    }

    const projects = await db
      .select()
      .from(projectTable)
      .where(inArray(projectTable.space_id, spaceIds))

    return projects
  } catch (error: any) {
    throw new Error(
      `Failed to retrieve projects by space IDs: ${error.message}`
    )
  }
}

export const addProjectRecentActivities = async (
  payLoad: InsertProjectRecentActivity
) => {
  try {
    const result = await db
      .insert(projectRecentActivityTable)
      .values({
        project_id: payLoad.project_id,
        icon: payLoad.icon,
        activity: payLoad.activity,
        deep_link: payLoad.deep_link
      })
      .returning()

    return result[0]
  } catch (error: any) {
    throw new Error(`Failed to add recent activity: ${error.message}`)
  }
}

export const getProjectRecentActivities = async (projectId: string) => {
  try {
    const activities = await db
      .select()
      .from(projectRecentActivityTable)
      .where(eq(projectRecentActivityTable.project_id, projectId))
      .orderBy(desc(projectRecentActivityTable.created_at))
      .limit(10)

    return activities
  } catch (error: any) {
    throw new Error(`Failed to retrieve recent activities: ${error.message}`)
  }
}
