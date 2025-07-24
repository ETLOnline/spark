"use server"
import {
  CreateTask,
  CreateTaskStatus,
  DeleteTask,
  DeleteTaskStatus,
  GetTaskById,
  GetTasksByStatusId,
  GetTaskCount,
  GetTasks,
  GetTaskStatusList,
  taskQueryFilters,
  UpdateTask,
  UpdateTaskStatus,
  createTaskComment,
  getTaskCommentsByTaskId
} from "@/src/db/data-access/tasks/query"
import { CreateServerAction } from ".."
import {
  InsertTask,
  InsertTaskComment,
  InsertTaskStatus,
  SelectTask
} from "@/src/db/schema"
import { getProjectById } from "@/src/db/data-access/project-management/query"
import { getInitials } from "@/src/utils/helpers"
import { PaginationType } from "@/src/components/common/types/pagination.type"

export const CreateTaskAction = CreateServerAction(
  true,
  async (taskData: InsertTask) => {
    try {
      const existingTaskCountResult = await GetTaskCount(taskData.project_id)
      const taskCount = existingTaskCountResult + 1

      const project = await getProjectById(taskData.project_id)
      if (!project) {
        return { success: false, error: "Project not found" }
      }
      const titleInitials = getInitials(project?.project_name)

      const task_num = `${titleInitials}-${taskCount}`

      const task = await CreateTask({ ...taskData, task_num: task_num })
      return { success: true, data: task }
    } catch (error) {
      return { error: error }
    }
  }
)

export interface GetTaskResponseType {
  tasks: SelectTask[]
  pagination: PaginationType
}

export const GetBacklogTasksAction = CreateServerAction(
  true,
  async (filters?: taskQueryFilters) => {
    try {
      const tasks: GetTaskResponseType = await GetTasks({ ...filters })

      return { success: true, data: tasks }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSprintTasksAction = CreateServerAction(
  true,
  async (filters?: taskQueryFilters) => {
    try {
      const tasks: GetTaskResponseType = await GetTasks({ ...filters })

      return { success: true, data: tasks }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetTaskByIdAction = CreateServerAction(
  true,
  async (taskId: string) => {
    try {
      const task = await GetTaskById(taskId)

      return { success: true, data: task }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetTasksByStatusIdAction = CreateServerAction(
  true,
  async (statusId: string) => {
    try {
      const tasks = await GetTasksByStatusId(statusId)

      return { success: true, data: tasks }
    } catch (error) {
      return { error: error }
    }
  }
)

export const UpdateTaskAction = CreateServerAction(
  true,
  async (taskId: string, updatedData: Partial<SelectTask>) => {
    try {
      const UpdatedTask = await UpdateTask(taskId, updatedData)
      return { success: true, data: UpdatedTask }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DeleteTaskAction = CreateServerAction(
  true,
  async (task: SelectTask) => {
    try {
      await DeleteTask(task)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const CreateTaskStatusAction = CreateServerAction(
  true,
  async (data: InsertTaskStatus) => {
    try {
      const status_slug = data.name.toLowerCase().replace(/\s+/g, "-")

      const taskStatus = await CreateTaskStatus({
        ...data,
        status_slug: status_slug
      })

      return { success: true, data: taskStatus }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetTaskStatusAction = CreateServerAction(
  true,
  async (projectId: string) => {
    try {
      const taskStatus = await GetTaskStatusList(projectId)

      return { success: true, data: taskStatus }
    } catch (error) {
      return { error: error }
    }
  }
)

export const UpdateTaskStatusAction = CreateServerAction(
  true,
  async (statusId: string, updatedData: InsertTaskStatus) => {
    try {
      const UpdatedTaskStatus = await UpdateTaskStatus(statusId, updatedData)

      return { success: true, data: UpdatedTaskStatus }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DeleteTaskStatusAction = CreateServerAction(
  true,
  async (statusId: string) => {
    try {
      await DeleteTaskStatus(statusId)
      return { success: true }
    } catch (error) {
      return { error: error }
    }
  }
)

export const CreateTaskCommentAction = CreateServerAction(
  true,
  async (input) => {
    try {
      const { task_id, user_id, content } = input

      const commentData: InsertTaskComment = {
        task_id: task_id,
        user_id: user_id,
        content: content
      }

      const newComment = await createTaskComment(commentData)

      if (newComment) {
        return { success: true, data: newComment }
      } else {
        return { success: false, error: "Failed to create comment." }
      }
    } catch (e: any) {
      console.error("Server action error creating task comment:", e)
      return {
        success: false,
        error: e.message || "An unexpected error occurred."
      }
    }
  }
)

export const GetTaskCommentsAction = CreateServerAction(
  true,
  async (filter) => {
    try {
      const { taskId, limit, offset } = filter
      const comments = await getTaskCommentsByTaskId(taskId, limit, offset)
      return { success: true, data: comments }
    } catch (e: any) {
      console.error("Server action error fetching task comments:", e)
      return {
        success: false,
        error: e.message || "An unexpected error occurred."
      }
    }
  }
)
