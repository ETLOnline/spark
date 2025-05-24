"use server"


import { InsertProject } from "@/src/db/schema";
import { CreateServerAction } from "..";
import { CreateProject, getProjectById, getProjects , createAttachProjectUser, getProjectUsers, removeProjectUser } from "@/src/db/data-access/project-management/query";

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

export const AttachProjectUserAction = CreateServerAction(
  true,
  async (projectId: string, userId: string, role: string = "member") => {
    try {
       const newProjectUser = await createAttachProjectUser(projectId, userId, "member")

      return { success: true, data: newProjectUser }
    } catch (error) {
      console.error("Error adding user to project:", error)
      return { error }
    }
  }
)

export const GetProjectUsersAction = CreateServerAction(
  true,
  async (projectId: string) => {
    try {
      const projectUsers = await getProjectUsers(projectId)
      return { success: true, data: projectUsers }
    } catch (error) {
      console.error("Error fetching project users:", error)
      return { error }
    }
  }
)

export const RemoveProjectUserAction = CreateServerAction(
  true,
  async (projectId: string, userId: string) => {
    try {
      const success = await removeProjectUser(projectId, userId)
      if (success) {
        return { success: true }
      }
      return { success: false, error: "User not found or already removed" }
    } catch (error) {
      console.error("Error removing project user:", error)
      return { success: false, error }
    }
  }
)