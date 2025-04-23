import { count, eq } from "drizzle-orm"
import { db } from "../.."
import { InsertTask, SelectTask, taskTable } from "../../schema"
import { getProjectById } from "../project-management/query"

export async function CreateTask(taskData: InsertTask){
  try{
    const existingTaskCountResult = await db.$count(taskTable)
    const taskCount = existingTaskCountResult + 1


    const project = await getProjectById(taskData.project_id)
    const titleInitials = project.project_name.split(' ').map(word => word[0]?.toUpperCase()).join('');

    const task_num = `${titleInitials} - ${taskCount}`

    const Task = await db.insert(taskTable).values({...taskData, task_num: task_num}).returning()
    return Task[0] 
  }catch(e:any){
     throw new Error(e.message)
  }
}

export async function GetTasks(projectId: string){
  try{
    const tasks = await db.select().from(taskTable).where(
      eq(taskTable.project_id, projectId)
    )
    return tasks
  }catch(e:any){
    throw new Error(e.message)
  }
}

// export async function TasksCount() {
//   try{
//     const taskCount = db.select({count: count()}).from(taskTable)
//     return taskCount
//   }catch(e:any){
//     throw new Error(e.message)
//   }
// }

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