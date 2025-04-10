import { desc, eq } from "drizzle-orm";
import { db } from "../..";
import { InsertProject, projectTable } from "../../schema";

export async function CreateProject(project_data:InsertProject) {
    try {
        const project = await db.insert(projectTable).values(project_data).returning()
        return project[0]
    } catch (e:any) {
        throw new Error(e.message)
    }
}

export async function getProjects() {
    try {
        const projects = await db.select().from(projectTable).orderBy(desc(projectTable.created_at))
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