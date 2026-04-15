"use server"

import { InsertProject, InsertProjectRecentActivity } from "@/src/db/schema"
import { CreateServerAction } from ".."
import {
  CreateProject,
  getProjectById,
  getProjects,
  createProjectUsers,
  getProjectUsers,
  removeProjectUser,
  updateProjectUserRole,
  updateProject,
  getExistingProjectUsers,
  createProjectUser,
  countProjectMembers,
  getProjectsBySpaceIds,
  addProjectRecentActivities,
  getProjectRecentActivities,
  getProjectusersProfileUrl
} from "@/src/db/data-access/project-management/query"
import { AddRewardAction, CheckRewardAlreadyGivenAction } from "../Reward/Reward"
import {
  createScopedProjectRolesAndAssignAdmin,
  deleteUserRole,
  getAndAssignViewerRoles
} from "@/src/db/data-access/roles/query"
import pusherServer from "@/src/services/realtime/pusherServer"
import { SendProjectNotifications } from "@/src/services/notifications/Project/utils"
import { createProjectInviteNotification } from "@/src/services/notify/project/project"
import { NotificationEvent } from "@/src/services/notify/types/events"
import { getSpaceUsers } from "@/src/db/data-access/spaces/query"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"
import { ActivityTypes } from "@/src/types/Rewards/rewards"
import { AuthUserAction } from "../User/AuthUserAction"

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

      pusherServer.trigger(
        `space-${newProject.space_id}-project`,
        "project-add",
        newProject
      )

      const projectURL = createAbsoluteUrl(`/project/${newProject.id}/Board`)

      await AddRewardAction(
        ActivityTypes.ProjectCreation,
        newProject.created_by,
        projectURL,
        {
          project_id: newProject.id,
          space_id: newProject.space_id
        }
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

      pusherServer.trigger(
        `space-${updatedProject.space_id}-project`,
        "project-edit",
        updatedProject
      )

      await pusherServer.trigger(
        "broadcast-entity-update-sidebar",
        "project-edit",
        updatedProject
      )
      const projectUrl = createAbsoluteUrl(`/project/${updatedProject.id}/details`)

      if ("description" in project_data && updatedProject.created_by) {
        const user = await AuthUserAction()
        if (user?.unique_id) {
          const overviewCheck = await CheckRewardAlreadyGivenAction(
            user.unique_id,
            ActivityTypes.ProjectOverviewUpdate,
            "project_id",
            updatedProject.id
          )

          if (!overviewCheck?.data?.alreadyRewarded) {
            await AddRewardAction(
              ActivityTypes.ProjectOverviewUpdate,
              user.unique_id,
              projectUrl,
              { project_id: updatedProject.id }
            )
          }
        }
      }

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
  async (projectId: string, WithChannelAndSpace: boolean = false) => {
    try {
      const project = await getProjectById(projectId, WithChannelAndSpace)
      return { success: true, data: project }
    } catch (error) {
      return { error: error }
    }
  }
)

export const AttachProjectUserAction = CreateServerAction(
  true,
  async (projectId: string, userIds: string[]) => {
    // Now accepts an array of user IDs
    try {
      const existingUserIds = await getExistingProjectUsers(projectId, userIds)

      const newUsersToAttach = userIds.filter(
        (userId) => !existingUserIds.includes(userId)
      )

      if (newUsersToAttach.length === 0) {
        console.log(
          `No new users to attach to project ${projectId}. All provided users already exist.`
        )
        return {
          success: true,
          message: "All provided users are already attached to the project.",
          data: []
        }
      }

      const usersToCreateWithRoles: { userId: string; role: string }[] = []
      const failedRoleAssignments: string[] = []

      for (const userId of newUsersToAttach) {
        try {
          const attachUserRole = await getAndAssignViewerRoles(
            userId,
            "project_viewer",
            projectId
          )

          const determinedRole = attachUserRole?.viewerRole?.name || "member"
          usersToCreateWithRoles.push({ userId, role: determinedRole })
          pusherServer.trigger(`user-${userId}`, "update-role", attachUserRole)
        } catch (roleError: any) {
          console.error(
            `Failed to get and assign viewer roles for user ${userId}: ${roleError.message}`
          )
          failedRoleAssignments.push(userId)
        }
      }

      if (
        usersToCreateWithRoles.length === 0 &&
        failedRoleAssignments.length > 0
      ) {
        return {
          success: false,
          error: `Failed to determine roles for any new users. Users: ${failedRoleAssignments.join(", ")}`
        }
      }

      const newProjectUsers = await createProjectUsers(
        projectId,
        usersToCreateWithRoles
      )

      const Project = await getProjectById(projectId)

      if (newProjectUsers.length > 0 && Project) {
        await SendProjectNotifications(
          NotificationEvent.PROJECT_INVITE,
          newProjectUsers,
          Project
        )
      }

      await createProjectInviteNotification(
        NotificationEvent.PROJECT_INVITE,
        newUsersToAttach,
        projectId
      )
      return { success: true, data: newProjectUsers, failedRoleAssignments }
    } catch (error: any) {
      return {
        success: false,
        error:
          error.message || "An unknown error occurred while attaching users."
      }
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

export const getProjectUserCountAndProfileUrlAction = CreateServerAction(
  true,
  async (
    projectId: string,
    usersProfileUrlLimit?: number,
    usersProfileUrlIsRendom?: boolean
  ) => {
    try {
      const project = await getProjectById(projectId)
      const spaceId = project?.space_id || ""

      const spaceUsers = await getSpaceUsers(spaceId)
      const projectUsers = await getProjectUsers(projectId)

      // Count only those project users who are also part of the space and have a non-null user object
      const totalMembersCount = projectUsers.filter((pu) =>
        spaceUsers.some((su) => su.user_id === pu.user_id && pu.user !== null)
      ).length

      const usersProfileUrl = await getProjectusersProfileUrl(
        projectId,
        usersProfileUrlLimit,
        usersProfileUrlIsRendom
      )

      return {
        success: true,
        data: {
          totalMembersCount,
          usersProfileUrl
        }
      }
    } catch (error) {
      console.error("Error fetching project user:", error)
      return { error }
    }
  }
)

export const RemoveProjectUserAction = CreateServerAction(
  true,
  async (projectId: string, userId: string, roleId: number) => {
    try {
      const success = await removeProjectUser(projectId, userId)
      const deleteRole = await deleteUserRole(userId, roleId)

      if (success) {
        pusherServer.trigger(`user-${userId}`, "update-role", deleteRole)
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

export const countProjectMembersAction = CreateServerAction(
  true,
  async (projectId: string) => {
    try {
      const count = await countProjectMembers(projectId)
      return { success: true, data: count }
    } catch (error) {
      console.error("Failed to count project members:", error)
      return { success: false, error }
    }
  }
)

export const GetProjectBySpaceIdsAction = CreateServerAction(
  true,
  async (spaceIds: string[]) => {
    try {
      const projects = await getProjectsBySpaceIds(spaceIds)
      return { success: true, data: projects }
    } catch (error) {
      console.error("Failed to get projects by space IDs:", error)
      return { success: false, error }
    }
  }
)

export const AddProjectRecentActivityAction = CreateServerAction(
  true,
  async (payLoad: InsertProjectRecentActivity) => {
    try {
      const result = await addProjectRecentActivities(payLoad)
      return { success: true, data: result }
    } catch (error) {
      console.error("Failed to add project recent activity:", error)
      return { success: false, error }
    }
  }
)

export const getProjectRecentActivitiesAction = CreateServerAction(
  true,
  async (projectId: string) => {
    try {
      const activities = await getProjectRecentActivities(projectId)
      return { success: true, data: activities }
    } catch (error) {
      console.error("Failed to get project recent activities:", error)
      return { success: false, error }
    }
  }
)
