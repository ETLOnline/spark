import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  like,
  or,
  sql,
  SQLWrapper
} from "drizzle-orm"
import { db } from "../.."
import {
  InsertTask,
  InsertTaskComment,
  InsertTaskStatus,
  SelectTask,
  SelectTaskComment,
  taskCommentsTable,
  TaskStatusTable,
  taskTable
} from "../../schema"

export type taskQueryFilters = {
  page?: number
  limit?: number
  project_id?: string
  searchedItem?: string
  orderList?: string
  sprint_id?: string
  priority?: string[]
  type?: string[]
  assignee?: string[]
  status?: string[]
  isSprint?: boolean
}

export async function CreateTask(taskData: InsertTask) {
  try {
    const [insertedTask] = await db
      .insert(taskTable)
      .values(taskData)
      .returning()

    const taskWithUsers = await GetTaskById(insertedTask.id)

    return taskWithUsers
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetTaskCount(projectId: string) {
  try {
    const Count = await db.$count(
      taskTable,
      eq(taskTable.project_id, projectId)
    )
    return Count
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetTasks(filters?: taskQueryFilters) {
  try {
    const page = filters?.page
    const limit = filters?.limit
    const offset = page && limit ? (page - 1) * limit : 0

    const whereClauses: (SQLWrapper | undefined)[] = []

    whereClauses.push(isNull(taskTable.deleted_at))

    if (filters) {
      if (filters.project_id) {
        whereClauses.push(eq(taskTable.project_id, filters.project_id))
      }

      if (filters.isSprint) {
        whereClauses.push(isNotNull(taskTable.sprint_id))
      } else if (filters.sprint_id) {
        whereClauses.push(eq(taskTable.sprint_id, filters.sprint_id))
      } else {
        whereClauses.push(isNull(taskTable.sprint_id))
      }

      if (filters.searchedItem) {
        whereClauses.push(
          or(
            like(taskTable.task_title, `%${filters.searchedItem}%`),
            like(taskTable.description, `%${filters.searchedItem}%`),
            like(taskTable.task_num, `%${filters.searchedItem}%`)
          )
        )
      }

      if (filters.priority && filters.priority.length > 0) {
        whereClauses.push(inArray(taskTable.task_priority, filters.priority))
      }

      if (filters.type && filters.type.length > 0) {
        whereClauses.push(inArray(taskTable.task_type, filters.type))
      }

      if (filters.assignee) {
        const assigneeList = filters.assignee.filter((a) => a !== "")

        const hasEmptyString = filters.assignee.includes("")

        if (assigneeList.length > 0 && hasEmptyString) {
          whereClauses.push(
            or(
              inArray(taskTable.assign_to, assigneeList),
              isNull(taskTable.assign_to)
            )
          )
        } else if (assigneeList.length > 0) {
          whereClauses.push(inArray(taskTable.assign_to, assigneeList))
        } else if (hasEmptyString) {
          whereClauses.push(isNull(taskTable.assign_to))
        }
      }

      if (filters.status && filters.status.length > 0) {
        whereClauses.push(inArray(taskTable.status_id, filters.status))
      }
    }

    const tasks = await db.query.taskTable.findMany({
      limit: limit,
      offset: offset,
      where: whereClauses.length ? and(...whereClauses) : undefined,
      orderBy: (taskTable, { asc, desc }) => [
        filters?.orderList === "desc"
          ? desc(taskTable.created_at)
          : asc(taskTable.created_at)
      ],
      with: {
        assignee: true,
        assignor: true
      }
    })

    const totalCount = await db.$count(
      taskTable,
      whereClauses.length ? and(...whereClauses) : undefined
    )

    return {
      tasks,
      pagination: {
        total: Number(totalCount),
        page: page || 1,
        limit: limit || 0,
        totalPages:
          limit && limit !== 0 ? Math.ceil(Number(totalCount) / limit) : 1
      }
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetTaskById(taskId: string) {
  try {
    const task = await db.query.taskTable.findFirst({
      where: and(isNull(taskTable.deleted_at), eq(taskTable.id, taskId)),
      with: {
        assignee: true,
        assignor: true
      }
    })

    return task
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetTasksByStatusId(statusId: string) {
  try {
    const tasks = await db
      .select()
      .from(taskTable)
      .where(
        and(isNull(taskTable.deleted_at), eq(taskTable.status_id, statusId))
      )

    return tasks
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function UpdateTask(
  taskId: string,
  updatedData: Partial<SelectTask>
) {
  try {
    const [UpdatedTask] = await db
      .update(taskTable)
      .set(updatedData)
      .where(eq(taskTable.id, taskId))
      .returning()

    const updatedTaskWithUsers = await GetTaskById(UpdatedTask.id)

    return updatedTaskWithUsers
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function DeleteTask(Task: SelectTask) {
  try {
    const deletedTask = await db
      .update(taskTable)
      .set({ deleted_at: sql`CURRENT_TIMESTAMP` })
      .where(eq(taskTable.id, Task.id))
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function CreateTaskStatus(data: InsertTaskStatus) {
  try {
    const taskStatus = await db.insert(TaskStatusTable).values(data).returning()
    return taskStatus
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetTaskStatusList(projectId: string) {
  try {
    const taskStatus = await db
      .select()
      .from(TaskStatusTable)
      .where(eq(TaskStatusTable.project_id, projectId))
      .orderBy(asc(TaskStatusTable.position))
    return taskStatus
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function UpdateTaskStatus(
  statusId: string,
  updatedData: InsertTaskStatus
) {
  try {
    const UpdatedTaskStatus = db
      .update(TaskStatusTable)
      .set(updatedData)
      .where(eq(TaskStatusTable.id, statusId))
      .returning()
    return UpdatedTaskStatus
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function DeleteTaskStatus(statusId: string) {
  try {
    await db.delete(TaskStatusTable).where(eq(TaskStatusTable.id, statusId))
  } catch (e: any) {
    throw new Error(e.message)
  }
}

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
  limit: number,
  offset: number
): Promise<SelectTaskComment[]> {
  try {
    const comments = await db.query.taskCommentsTable.findMany({
      where: eq(taskCommentsTable.task_id, taskId),
      with: {
        user: true
      },
      orderBy: desc(taskCommentsTable.id),
      limit: limit,
      offset: offset
    })
    return comments
  } catch (error) {
    console.error(`Error fetching comments for task ${taskId}:`, error)
    return []
  }
}
