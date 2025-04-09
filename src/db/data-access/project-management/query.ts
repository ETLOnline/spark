import { db } from "../..";
import { InsertProject, projectTable } from "../../schema";

export async function CreateProject(project_data:InsertProject) {
    try {
        const project = await db.insert(projectTable).values(project_data).returning()
        return project
    } catch (e:any) {
        throw new Error(e.message)
    }
}

export async function getProjects() {
    try {
        const projects = await db.select().from(projectTable)
        return projects
    } catch (e:any) {
        throw new Error(e.message)
    }
}