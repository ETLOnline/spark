import { and, desc, eq } from "drizzle-orm";
import { db } from "../..";
import { InsertProject, projectTable, spacesTable } from "../../schema";

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

export async function UpdateProject(project_data: InsertProject) {
    try {
      if (!project_data.id) {
        throw new Error("Project ID is required for update.");
      }
  
      const updatedProject = await db
        .update(projectTable)
        .set(project_data)
        .where(eq(projectTable.id, project_data.id))
        .returning();
  
      return updatedProject[0];
    } catch (e: any) {
      throw new Error(e.message);
    }
  }