"use server"
import { formatContent } from "@/src/utils/helpers"
import { CreateServerAction } from ".."
import { extractMentionsFromMessage } from "@/src/services/realtime/utils/helper"
import { InsertTaskComment } from "@/src/db/schema"
import {
  createTaskComment,
  DeleteTaskComment,
  getTaskCommentById,
  getTaskCommentsByTaskId,
  UpdateTaskComment
} from "@/src/db/data-access/tasks/taskComments/query"
import { GetTaskById } from "@/src/db/data-access/tasks/query"
import { SendTaskNotifications } from "@/src/services/notifications/Tasks/utils"
import { addProjectRecentActivity } from "@/src/utils/taskHelpr"

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

export const UpdateTaskCommentAction = CreateServerAction(
  true,
  async (taskCommentId: number, content: string) => {
    try {
      const updatedComment = await UpdateTaskComment(taskCommentId, content)

      const taskComment = await getTaskCommentById(updatedComment?.id || 0)

      return { success: true, data: taskComment }
    } catch (e: any) {
      console.error("Server action error updating task comment:", e)
      return {
        success: false,
        error: e.message || "An unexpected error occurred."
      }
    }
  }
)

export const DeleteTaskCommentAction = CreateServerAction(
  true,
  async (taskCommentId: number) => {
    try {
      const deleted = await DeleteTaskComment(taskCommentId)
      return { success: true, data: deleted }
    } catch (e: any) {
      console.error("Server action error deleting task comment:", e)
      return {
        success: false,
        error: e.message || "An unexpected error occurred."
      }
    }
  }
)
