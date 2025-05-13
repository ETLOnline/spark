import { and, asc, count, eq, like, or, SQLWrapper } from "drizzle-orm"
import { db } from "../.."
import { InsertTask, InsertTaskStatus, SelectTask, TaskStatusTable, taskTable } from "../../schema"

export type taskQueryFilters = {
  page?: number,
  limit?: number,
  project_id?: string,
  searchedItem?: string
  orderList?: string
}

export async function CreateTask(taskData: InsertTask){
  try{
    const Task = await db.insert(taskTable).values(taskData).returning()
    return Task[0] 
  }catch(e:any){
     throw new Error(e.message)
  }
}

export async function GetTaskCount(projectId: string) {
  try{
    const Count = await db.$count(
      taskTable,
      eq(taskTable.project_id, projectId)
    )
    return Count
  }catch(e:any){
    throw new Error(e.message)
  }
}


export async function GetTasks(filters?: taskQueryFilters) {
  try{

    const page =  filters?.page
    const limit =  filters?.limit
    const offset = page && limit ? (page - 1) * limit : 0
  
    const whereClauses:(SQLWrapper | undefined )[]= []
  
  
    if(filters){
  
      if(filters.project_id){
        whereClauses.push(
          eq(taskTable.project_id, filters.project_id),
        )
      }


      if(filters.searchedItem){
        whereClauses.push(
          or(
            like(taskTable.task_title, `%${filters.searchedItem}%`),
            like(taskTable.description, `%${filters.searchedItem}%`),
            like(taskTable.task_num, `%${filters.searchedItem}%`)
          )
        )
      }
      
    }
  
    const tasks = await db.query.taskTable.findMany({
      limit: limit,
      offset: offset,
      where: whereClauses.length ? and(...whereClauses) : undefined,
      orderBy: (taskTable, {asc, desc}) => [
        filters?.orderList === 'desc' 
        ? desc(taskTable.created_at)
        : asc(taskTable.created_at)
      ]
    })
  
    const totalCount = await db.$count(
      taskTable,
      whereClauses.length ? and(...whereClauses) : undefined
    )
  
    return{
      tasks, 
      pagination: {
        total: Number(totalCount),
        page: page || 1,
        limit: limit || 0,
        totalPages: limit && limit !== 0 ?  Math.ceil(Number(totalCount) / limit) : 1 
      }
    }
  }catch(e:any){
    throw new Error(e.message)
  }
}

export async function GetTaskById(taskId: string){
  try{
    const task = await db.select().from(taskTable).where(
      eq(taskTable.id, taskId)
    )

    return task[0]
  }catch(e:any){
    throw new Error(e.message)
  }
}

export async function GetTasksByStatusId(statusId: string){
  try{
    const tasks = await db.select().from(taskTable).where(
      eq(taskTable.status_id, statusId)
    )

    return tasks
  }catch(e:any){
    throw new Error(e.message)
  }
}



export async function UpdateTask(taskId: string, updatedData: SelectTask){
  try{
    const UpdatedTask = await db.update(taskTable).set(updatedData).where(
      eq(taskTable.id, taskId)
    ).returning()

    return UpdatedTask[0]

  }catch(e:any){
    throw new Error(e.message)
  }
}

export async function DeleteTask(Task: SelectTask){
  try{
    const deletedTask = await db.delete(taskTable).where(
      eq(taskTable.id, Task.id)
    )

    return deletedTask

  }catch(e:any){
    throw new Error(e.message)
  }
}


export async function CreateTaskStatus(data: InsertTaskStatus) {
  try{
      const taskStatus = await db.insert(TaskStatusTable).values(data).returning()
      return taskStatus
  }catch(e:any){
      throw new Error(e.message)
  }
}


export async function GetTaskStatusList(projectId: string){
  try{
      const taskStatus = await db.select().from(TaskStatusTable).where(
        eq(TaskStatusTable.project_id, projectId)
      ).orderBy(asc(TaskStatusTable.position))
      return taskStatus
  }catch(e:any){
      throw new Error(e.message)
  }
}


export async function UpdateTaskStatus(statusId: string, updatedData: InsertTaskStatus){
  try{
    const UpdatedTaskStatus = db.update(TaskStatusTable).set(updatedData).where(
      eq(TaskStatusTable.id, statusId)
    ).returning()
    return UpdatedTaskStatus
  }catch(e:any){
    throw new Error(e.message)
  }
}


export async function DeleteTaskStatus(statusId: string){
  try{
    await db.delete(TaskStatusTable).where(
      eq(TaskStatusTable.id, statusId)
    )
  }catch(e:any){
    throw new Error(e.message)
  }
}