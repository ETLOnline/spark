import { and, eq, inArray } from "drizzle-orm"
import { db } from "../.."
import {
  InsertProject,
  projectTable,
  ProjectUsersTable,
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

export async function getProjectById(projectId: string) {
  try {
    const project = await db
      .select()
      .from(projectTable)
      .where(eq(projectTable.id, projectId))
    return project[0]
  } catch (e: any) {
    throw new Error(e.message)
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
export async function getProjectUsers(projectId: string) {
  try {
    const projectUsers = await db.query.ProjectUsersTable.findMany({
      with: {
        user: true
      },
      where: eq(ProjectUsersTable.project_id, projectId)
    })

    return projectUsers
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
