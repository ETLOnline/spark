import { and, eq } from "drizzle-orm";
import { db } from "../..";
import { InsertProject,  projectTable, ProjectUsersTable, usersTable } from "../../schema";

export async function CreateProject(project_data:InsertProject) {
    try {
        const project = await db.insert(projectTable).values(project_data).returning()
        return project[0]
    } catch (e:any) {
        throw new Error(e.message)
    }
}

export async function getProjects(spaceId: string) {
    try {
        const projects = await db.select().from(projectTable).where(
            eq(projectTable.space_id, spaceId)
        )
        return projects
    } catch (e:any) {
        throw new Error(e.message)
    }
}

export async function getProjectById(projectId: string) {
    try {
        const project = await db.select().from(projectTable).where(
            eq(projectTable.id, projectId)
        )
        return project[0]
    } catch (e:any) {
        throw new Error(e.message)
    }
}
export async function createAttachProjectUser(projectId: string, userId: string, role: string = "member") {
    try {
        const newProjectUser = await db.insert(ProjectUsersTable).values({
        project_id: projectId,
        user_id: userId,
        role,
      }).returning()
        return newProjectUser[0]
    } catch (e:any) {
        throw new Error(e.message)
    }
}
export async function getProjectUsers(projectId: string) {
  try {
    const projectUsers = await db
        .select({
          id: ProjectUsersTable.id,
          project_id: ProjectUsersTable.project_id,
          user_id: ProjectUsersTable.user_id,
          role: ProjectUsersTable.role,
          status: ProjectUsersTable.status,
          updated_at: ProjectUsersTable.updated_at,
          created_at: ProjectUsersTable.created_at,
          user: {
            unique_id: usersTable.unique_id,
            first_name: usersTable.first_name,
            last_name: usersTable.last_name,
            email: usersTable.email,
            external_auth_id: usersTable.external_auth_id,
            profile_url: usersTable.profile_url,
            meta: usersTable.meta,
            bio: usersTable.bio,
            role: usersTable.role,
          },
        })
        .from(ProjectUsersTable)
        .leftJoin(usersTable, eq(ProjectUsersTable.user_id, usersTable.unique_id))
        .where(eq(ProjectUsersTable.project_id, projectId))

    // Remove users where user is null (just in case)
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