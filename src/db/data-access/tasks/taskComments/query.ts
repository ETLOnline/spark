import { db } from "@/src/db"
import {
  InsertTaskComment,
  SelectTaskComment,
  taskCommentsTable
} from "@/src/db/schema"
import { desc, eq, sql } from "drizzle-orm"

export async function createTaskComment(
  commentData: InsertTaskComment
): Promise<SelectTaskComment | null> {
  try {
    const [newComment] = await db
      .insert(taskCommentsTable)
      .values(commentData)
      .returning()
    return newComment || null
  } catch (error) {
    console.error("Error creating task comment:", error)
    return null
  }
}

export async function getTaskCommentsByTaskId(
  taskId: string,
  limit?: number,
  offset?: number
): Promise<{ comments: SelectTaskComment[]; totalCount: number }> {
  try {
    // 1. Paginated comments
    const comments = await db.query.taskCommentsTable.findMany({
      where: eq(taskCommentsTable.task_id, taskId),
      with: { user: true },
      orderBy: desc(taskCommentsTable.id),
      limit,
      offset
    })

    // 2. Count total comments
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(taskCommentsTable)
      .where(eq(taskCommentsTable.task_id, taskId))

    const totalCount = totalCountResult[0]?.count ?? 0

    return { comments, totalCount }
  } catch (error) {
    console.error(`Error fetching comments for task ${taskId}:`, error)
    return { comments: [], totalCount: 0 }
  }
}
export function getTaskCommentById(taskCommentId: number) {
  try {
    const comment = db.query.taskCommentsTable.findFirst({
      where: eq(taskCommentsTable.id, taskCommentId),
      with: {
        user: true
      }
    })
    return comment
  } catch (error) {
    console.error(`Error fetching comment ${taskCommentId}:`, error)
    return null
  }
}

export async function UpdateTaskComment(
  taskCommentId: number,
  content: string
) {
  try {
    const updatedComment = await db
      .update(taskCommentsTable)
      .set({ content: content })
      .where(eq(taskCommentsTable.id, taskCommentId))
      .returning()
    return updatedComment[0]
  } catch (error) {
    console.error(`Error updating comment ${taskCommentId}:`, error)
    return null
  }
}

export async function DeleteTaskComment(taskCommentId: number) {
  try {
    await db
      .delete(taskCommentsTable)
      .where(eq(taskCommentsTable.id, taskCommentId))
    return true
  } catch (error) {
    console.error(`Error deleting comment ${taskCommentId}:`, error)
    return false
  }
}
