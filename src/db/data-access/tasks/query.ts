import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  like,
  not,
  notInArray,
  or,
  sql,
  SQLWrapper
} from "drizzle-orm"
import { db } from "../.."
import {
  InsertTask,
  InsertTaskStatus,
  SelectTask,
  SelectTaskComment,
  SprintTable,
  taskCommentsTable,
  TaskStatusTable,
  taskTable
} from "../../schema"
import { ProjectStatus } from "@/src/components/Dashboard/ProjectManagement/types/projectStatus.type"

export type taskQueryFilters = {
  page?: number
  limit?: number
  project_id?: string
  searchedItem?: string
  orderList?: string
  sprint_id?: string
  sprint_ids?: string[]
  priority?: string[]
  type?: string[]
  assignee?: string[]
  creator?: string[]
  status?: string[]
  parent_id?: string
  excludedTypes?: string[]
}

export type SprintTaskCountFilters = {
  project_id?: string
  sprint_id?: string
  total?: boolean
  done?: boolean
  inProgress?: boolean
  todo?: boolean
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

      if (filters.sprint_ids) {
        whereClauses.push(inArray(taskTable.sprint_id, filters.sprint_ids))
      } else if (filters.sprint_id) {
        whereClauses.push(eq(taskTable.sprint_id, filters.sprint_id))
      } else {
        whereClauses.push(isNull(taskTable.sprint_id))
      }

      if (filters.searchedItem) {
        whereClauses.push(
          or(
            ilike(taskTable.task_title, `%${filters.searchedItem}%`),
            ilike(taskTable.task_num, `%${filters.searchedItem}%`)
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

      if (filters.creator && filters.creator.length > 0) {
        whereClauses.push(inArray(taskTable.created_by, filters.creator))
      }

      if (filters.status && filters.status.length > 0) {
        whereClauses.push(inArray(taskTable.status_id, filters.status))
      }

      if (filters.parent_id) {
        whereClauses.push(eq(taskTable.parent_task_id, filters.parent_id))
      }

      if (filters.excludedTypes && filters.excludedTypes.length > 0) {
        whereClauses.push(
          not(inArray(taskTable.task_type, filters.excludedTypes))
        )
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
        assignor: true,
        status: true,
        parentTask: true,
        subTasks: true,
        creator: true,
        testedBy: true
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

export async function checkIfTaskIsParent(task_id: string) {
  try {
    const res = await db
      .select({ id: taskTable.id })
      .from(taskTable)
      .where(
        and(eq(taskTable.parent_task_id, task_id), isNull(taskTable.deleted_at))
      )

    return res.length > 0
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
        assignor: true,
        status: true,
        parentTask: true,
        subTasks: true,
        creator: true,
        testedBy: true
      }
    })

    return task
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetTaskByIds(taskId: string[]) {
  try {
    const tasks = await db.query.taskTable.findMany({
      where: and(isNull(taskTable.deleted_at), inArray(taskTable.id, taskId)),
      with: {
        assignee: true,
        assignor: true,
        status: true,
        parentTask: true,
        subTasks: true,
        creator: true,
        testedBy: true
      }
    })

    return tasks
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

export async function GetBacklogTaskCount(projectId: string) {
  try {
    const Count = await db.$count(
      taskTable,
      and(
        eq(taskTable.project_id, projectId),
        isNull(taskTable.sprint_id),
        isNull(taskTable.deleted_at)
      )
    )
    return Count
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function GetSprintTaskCount(filters?: SprintTaskCountFilters) {
  try {
    const project_id = filters?.project_id
    const sprint_id = filters?.sprint_id
    const done = filters?.done
    const inProgress = filters?.inProgress
    const todo = filters?.todo

    if (!project_id) {
      throw new Error("Project ID is required")
    }

    const needStatus = done || inProgress || todo

    let statuses: { id: string; status_slug: string | null }[] = []
    if (needStatus) {
      statuses = await db.query.TaskStatusTable.findMany({
        where: eq(TaskStatusTable.project_id, project_id),
        columns: {
          id: true,
          status_slug: true
        }
      })
    }

    const doneStatusId = statuses.find(
      (s) => s.status_slug === ProjectStatus.Done
    )?.id
    const todoStatusId = statuses.find(
      (s) => s.status_slug === ProjectStatus.ToDo
    )?.id

    const whereClauses: (SQLWrapper | undefined)[] = []

    whereClauses.push(
      eq(taskTable.project_id, project_id),
      isNull(taskTable.deleted_at)
    )

    if (sprint_id) {
      whereClauses.push(eq(taskTable.sprint_id, sprint_id))
    } else {
      whereClauses.push(isNull(taskTable.sprint_id))
    }

    const results: Record<string, number> = {}

    results.totalTasksCount = await db.$count(taskTable, and(...whereClauses))

    if (done && doneStatusId) {
      results.DoneTasksCount = await db.$count(
        taskTable,
        and(...whereClauses, eq(taskTable.status_id, doneStatusId))
      )
    }

    if (inProgress && (todoStatusId || doneStatusId)) {
      const excludeStatusIds = [todoStatusId, doneStatusId].filter(
        (id): id is string => !!id
      )

      results.InProgressTasksCount = await db.$count(
        taskTable,
        and(...whereClauses, notInArray(taskTable.status_id, excludeStatusIds))
      )
    }

    if (todo && todoStatusId) {
      results.TodoTasksCount = await db.$count(
        taskTable,
        and(...whereClauses, eq(taskTable.status_id, todoStatusId))
      )
    }

    return results
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

    if (UpdatedTask.sprint_id) {
      await db
        .update(SprintTable)
        .set({ updated_at: sql`CURRENT_TIMESTAMP` })
        .where(eq(SprintTable.id, UpdatedTask.sprint_id))
    }

    const updatedTasksWithUsers = GetTaskById(UpdatedTask.id)

    return updatedTasksWithUsers
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function UpdateTasksSprint(
  task_ids: string[],
  sprint_id: string,
  oldSprintId?: string
) {
  try {
    const updatedTasks = await db
      .update(taskTable)
      .set({ sprint_id: sprint_id })
      .where(inArray(taskTable.id, task_ids))
      .returning()

    if (sprint_id) {
      await db
        .update(SprintTable)
        .set({ updated_at: sql`CURRENT_TIMESTAMP` })
        .where(eq(SprintTable.id, sprint_id))
    }

    if (oldSprintId) {
      await db
        .update(SprintTable)
        .set({ updated_at: sql`CURRENT_TIMESTAMP` })
        .where(eq(SprintTable.id, oldSprintId))
    }

    const updatedTasksWithUsers = await Promise.all(
      updatedTasks.map((t) => GetTaskById(t.id))
    )

    return updatedTasksWithUsers
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
