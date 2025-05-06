"use server"


import { InsertProject } from "@/src/db/schema";
import { CreateServerAction } from "..";
import { CreateProject, getProjectById, getProjects ,UpdateProject } from "@/src/db/data-access/project-management/query";

export const CreateProjectAction = CreateServerAction(true, async (project_data:InsertProject) => {
    try{
        const newProject = await CreateProject(project_data)
        return {success: true, data: newProject}
    }
    catch(error){
        return {error: error}
    }
}

)

export const UpdateProjectAction = CreateServerAction(true, async (project_data: InsertProject) => {
  try {
    const updatedProject = await UpdateProject(project_data)
    return { success: true, data: updatedProject }
  } catch (error) {
    return { error }
  }
})

export const GetProjectsAction = CreateServerAction(
    true,
    async (spaceId: string) => {
      try {
        const projects = await getProjects(spaceId)
        return { success: true, data: projects }
      } catch (error) {
        return { error }
      }
    }
  )
  

export const GetProjectByIdAction = CreateServerAction(true, async (projectId: string) => {
    try {
        const project = await getProjectById(projectId)
        return {success: true, data: project}
    } catch (error) {
        return {error: error}
    }
})