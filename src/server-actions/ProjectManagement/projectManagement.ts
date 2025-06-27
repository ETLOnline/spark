"use server"

import { InsertProject } from "@/src/db/schema"
import { CreateServerAction } from ".."
import {
  CreateProject,
  getProjectById,
  getProjects,
  createProjectUser,
  getProjectUsers,
  removeProjectUser,
  updateProjectUserRole,
  updateProject
} from "@/src/db/data-access/project-management/query"
import { createScopedProjectRolesAndAssignAdmin } from "@/src/db/data-access/roles/query"

export const CreateProjectAction = CreateServerAction(
  true,
  async (project_data: InsertProject) => {
    try {
      const newProject = await CreateProject(project_data)
      const result = await createScopedProjectRolesAndAssignAdmin(
        newProject.id,
        newProject.project_name,
        newProject.created_by
      )
      const attachUser = await createProjectUser(
        newProject.id,
        newProject.created_by,
        result?.adminRole?.name
      )
      return { success: true, data: newProject }
    } catch (error) {
      return { error }
    }
  }
)

export const UpdateProjectAction = CreateServerAction(
  true,
  async (project_data: Partial<InsertProject>) => {
    try {
      const updatedProject = await updateProject(project_data)
      return { success: true, data: updatedProject }
    } catch (error) {
      return { error }
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

export const GetProjectByIdAction = CreateServerAction(
  true,
  async (projectId: string) => {
    try {
      const project = await getProjectById(projectId)
      return { success: true, data: project }
    } catch (error) {
      return { error: error }
    }
  }
)

export const AttachProjectUserAction = CreateServerAction(
  true,
  async (projectId: string, userId: string, role?: string) => {
    try {
      const newProjectUser = await createProjectUser(
        projectId,
        userId,
        role ?? "viewer"
      )

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

export const UpdateProjectUserRoleAction = CreateServerAction(
  true,
  async (projectId: string, userId: string, role: string) => {
    try {
      const projectUsers = await updateProjectUserRole(projectId, userId, role)
      return { success: true, data: projectUsers }
    } catch (error) {
      console.error("Failed to update project user role:", error)
      return { success: false, error }
    }
  }
)
