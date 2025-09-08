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
  getTaskCommentsByTaskId,
  UpdateTasksSprint
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
import pusherServer from "@/src/services/realtime/pusherServer"
import {
  base64ToBuffer,
  uploadFileAndSaveMetadata
} from "@/src/services/storage/utils/fileUtils"
import { beamsServerClient } from "@/src/services/notifications/BeamServer"
import { AuthUserAction } from "../User/AuthUserAction"
import { auth } from "@clerk/nextjs/server"

export const CreateTaskAction = CreateServerAction(
  true,
  async (taskData: InsertTask, page_name?: string) => {
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

      pusherServer.trigger(
        `project-${taskData.project_id}-tasks`,
        "task-add",
        task
      )

      await beamsServerClient.publishToInterests([`user-${task?.assign_to}`], {
        web: {
          notification: {
            title: `New Task Assigned: ${task?.task_num}`,
            body: `You have been assigned a new task in project "${project?.project_name}".`,
            deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/project/${project?.id}/task/${task?.id}`
          }
        }
      })

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
  async (
    taskId: string,
    updatedData: Partial<SelectTask>,
    page_name?: string
  ) => {
    try {
      const authUser = await AuthUserAction()

      const UpdatedTask = await UpdateTask(taskId, updatedData)

      const isAssignee = authUser.unique_id === UpdatedTask?.assign_to
      const isAssignor = authUser.unique_id === UpdatedTask?.assign_by

      pusherServer.trigger(
        `project-${UpdatedTask?.project_id}-tasks`,
        "task-update",
        UpdatedTask
      )

      if (isAssignee) {
        await beamsServerClient.publishToInterests(
          [`user-${UpdatedTask.assign_by}`],
          {
            web: {
              notification: {
                title: `Task Updated`,
                body: `${authUser.first_name} ${authUser.last_name} updated the task ${UpdatedTask?.task_num}.`,
                deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/project/${updatedData?.project_id}/task/${UpdatedTask?.id}`
              }
            }
          }
        )
      } else if (isAssignor) {
        await beamsServerClient.publishToInterests(
          [`user-${UpdatedTask.assign_to}`],
          {
            web: {
              notification: {
                title: `Task Updated`,
                body: `${authUser.first_name} ${authUser.last_name} updated the task ${UpdatedTask?.task_num}.`,
                deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/project/${UpdatedTask?.project_id}/task/${UpdatedTask?.id}`
              }
            }
          }
        )
      } else {
        await beamsServerClient.publishToInterests(
          [`user-${UpdatedTask?.assign_to}`, `user-${UpdatedTask?.assign_by}`],
          {
            web: {
              notification: {
                title: `Task Updated`,
                body: `${authUser.first_name} ${authUser.last_name} updated the task ${UpdatedTask?.task_num}.`,
                deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/project/${UpdatedTask?.project_id}/task/${UpdatedTask?.id}`
              }
            }
          }
        )
      }

      return { success: true, data: UpdatedTask }
    } catch (error) {
      return { error: error }
    }
  }
)

export const UpdateTasksSprintAction = CreateServerAction(
  true,
  async (task_ids: string[], sprint_id: string) => {
    try {
      const AuthUser = await AuthUserAction()

      const updatedTasks = await UpdateTasksSprint(task_ids, sprint_id)

      return { success: true, data: updatedTasks }
    } catch (error) {
      return { error: error }
    }
  }
)

export const DeleteTaskAction = CreateServerAction(
  true,
  async (task: SelectTask, page_name?: string) => {
    try {
      await DeleteTask(task)

      pusherServer.trigger(
        `project-${task.project_id}-tasks`,
        "task-delete",
        task
      )

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
      const authUser = await AuthUserAction()

      const { task_id, user_id, content } = input

      const commentData: InsertTaskComment = {
        task_id: task_id,
        user_id: user_id,
        content: content
      }

      const task = await GetTaskById(task_id)

      const newComment = await createTaskComment(commentData)

      if (newComment) {
        if (authUser.unique_id === task?.assign_by) {
          await beamsServerClient.publishToInterests(
            [`user-${task?.assign_to}`],
            {
              web: {
                notification: {
                  title: `New Comment on Task: ${task?.task_num}`,
                  body: `${authUser.first_name} ${authUser.last_name} commented on the task "${task?.task_num}".`,
                  deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/project/${task?.project_id}/task/${task?.id}`
                }
              }
            }
          )
        } else if (authUser.unique_id === task?.assign_to) {
          await beamsServerClient.publishToInterests(
            [`user-${task?.assign_by}`],
            {
              web: {
                notification: {
                  title: `New Comment on Task: ${task?.task_num}`,
                  body: `${authUser.first_name} ${authUser.last_name} commented on the task "${task?.task_num}".`,
                  deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/project/${task?.project_id}/task/${task?.id}`
                }
              }
            }
          )
        } else {
          await beamsServerClient.publishToInterests(
            [`user-${task?.assign_by}`, `user-${task?.assign_to}`],
            {
              web: {
                notification: {
                  title: `New Comment on Task: ${task?.task_num}`,
                  body: `${authUser.first_name} ${authUser.last_name} commented on the task "${task?.task_num}".`,
                  deep_link: `${process.env.NEXT_PUBLIC_APP_URL}/project/${task?.project_id}/task/${task?.id}`
                }
              }
            }
          )
        }

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

export const AddImageToTaskAction = CreateServerAction(
  true,
  async (fileName: string, fileB64string: string, fileType: string) => {
    try {
      const fileBuffer = base64ToBuffer(fileB64string)

      const { fileUrl } = await uploadFileAndSaveMetadata(
        fileBuffer,
        fileName,
        fileType,
        "tasks"
      )

      return { success: true, data: fileUrl }
    } catch (error) {
      return { error: error }
    }
  }
)
