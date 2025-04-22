"use server"
import { CreateTask, DeleteTask, GetTasks, UpdateTask} from "@/src/db/data-access/tasks/query";
import { CreateServerAction } from "..";
import { InsertTask, SelectTask } from "@/src/db/schema";

export const CreateTaskAction = CreateServerAction(
  true,
  async (taskData: InsertTask) => {
    try {
      const task = await CreateTask(taskData)
      return { success: true, data: task }
    } catch (error) {
      console.log(error)
      return { error:error }
    }
  }
)


export const GetTaskAction = CreateServerAction(
  true,
  async (projectId: string) => {
    try{
      const tasks = await GetTasks(projectId)
      return {success: true, data: tasks}
    }catch(error){
      return {error: error}
    }
  }
)
// export const getTaskCountAction = CreateServerAction(
//   true,
//   async() => {
//     try{
//       const taskCount = await TasksCount()
//       return {success: true, data: taskCount}
//     }catch(error){
//       return{error: error}
//     }
//   }
// )

export const UpdateTaskAction = CreateServerAction(
  true,
  async (taskId: string, updatedData: SelectTask) => {
    try{
      const UpdatedTask = await UpdateTask(taskId, updatedData)
      return { success: true, data: UpdatedTask}
    }catch(error){
      return {error: error}
    }
  }
)


export const DeleteTaskAction = CreateServerAction(
  true,
  async (task: SelectTask)=>{
    try{
      await DeleteTask(task)
      return {success: true}
    }catch(error){
      return {error: error}
    }
  }
)