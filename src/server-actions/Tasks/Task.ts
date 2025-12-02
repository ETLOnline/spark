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
  UpdateTasksSprint,
  GetBacklogTaskCount,
  GetSprintTaskCount,
  SprintTaskCountFilters,
  checkIfTaskIsParent,
  GetTaskByIds
} from "@/src/db/data-access/tasks/query"
import { CreateServerAction } from ".."
import {
  InsertTask,
  InsertTaskComment,
  InsertTaskStatus,
  SelectTask
} from "@/src/db/schema"
import { getProjectById } from "@/src/db/data-access/project-management/query"
import { formatContent, getInitials } from "@/src/utils/helpers"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import pusherServer from "@/src/services/realtime/pusherServer"
import { createTaskNotification } from "@/src/services/notify/task/task"
import { SendTaskNotifications } from "@/src/services/notifications/Tasks/utils"
import { NotificationEvent } from "@/src/services/notify/types/events"
import { addProjectRecentActivity } from "@/src/utils/taskHelpr"
import { AddTaskHistoryAction } from "./TaskHistory"
import { extractMentionsFromMessage } from "@/src/services/realtime/utils/helper"

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

      if (task) {
        await SendTaskNotifications("task_assigned", task, project)
        await addProjectRecentActivity("task_created", task)
      }

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

export const GetLinkedTasksAction = CreateServerAction(
  true,
  async (filters?: taskQueryFilters) => {
    try {
      const subTasks = await GetTasks({ ...filters })

      return { success: true, data: subTasks }
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

export const GetTaskByIdsAction = CreateServerAction(
  true,
  async (taskIds: string[]) => {
    try {
      const tasks = await GetTaskByIds(taskIds)

      return { success: true, data: tasks }
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
      const oldTask = await GetTaskById(taskId)

      const UpdatedTask = await UpdateTask(taskId, updatedData)

      if (UpdatedTask) {
        await SendTaskNotifications(NotificationEvent.UPDATE_TASK, UpdatedTask)
        await addProjectRecentActivity("task_updated", UpdatedTask)
      }

      if (UpdatedTask && oldTask) {
        pusherServer.trigger(
          `project-${UpdatedTask?.project_id}-tasks`,
          "task-update",
          UpdatedTask
        )
        createTaskNotification(
          NotificationEvent.UPDATE_TASK,
          UpdatedTask,
          oldTask
        )

        await AddTaskHistoryAction(oldTask, UpdatedTask)

        return { success: true, data: UpdatedTask }
      }

      return { success: true, data: UpdatedTask }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetBacklogTaskCountAction = CreateServerAction(
  true,
  async (projectId: string) => {
    try {
      const taskCount = await GetBacklogTaskCount(projectId)

      return { success: true, data: taskCount }
    } catch (error) {
      return { error: error }
    }
  }
)

export const GetSprintTaskCountAction = CreateServerAction(
  true,
  async (filters?: SprintTaskCountFilters) => {
    try {
      const taskCount = await GetSprintTaskCount({ ...filters })

      return { success: true, data: taskCount }
    } catch (error) {
      return { error: error }
    }
  }
)

export const UpdateTasksSprintAction = CreateServerAction(
  true,
  async (
    task_ids: string[],
    sprint_id: string | null,
    oldSprintId?: string
  ) => {
    try {
      const updatedTasks = await UpdateTasksSprint(
        task_ids,
        sprint_id || "",
        oldSprintId
      )

      return { success: true, data: updatedTasks }
    } catch (error) {
      return { error }
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

export const checkIfTaskIsParentAction = CreateServerAction(
  true,
  async (taskId: string) => {
    try {
      const res = await checkIfTaskIsParent(taskId)

      return { success: true, data: res }
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

      const formatComment = formatContent(content || "")

      const mentionedUsers = extractMentionsFromMessage(formatComment)

      const commentData: InsertTaskComment = {
        task_id: task_id,
        user_id: user_id,
        content: content,
        mentions: mentionedUsers
      }

      const newComment = await createTaskComment({
        ...commentData,
        type: "comment"
      })

      const task = await GetTaskById(task_id)

      if (task) {
        await SendTaskNotifications(
          "task_commented",
          task,
          undefined,
          newComment
        )
        await addProjectRecentActivity("task_commented", task)
      }

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
