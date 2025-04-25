"use server"
import { CreateTask, DeleteTask, GetTaskCount, GetTasks, taskQueryFilters, UpdateTask} from "@/src/db/data-access/tasks/query";
import { CreateServerAction } from "..";
import { InsertTask, SelectTask } from "@/src/db/schema";
import { getProjectById } from "@/src/db/data-access/project-management/query";
import { getInitials } from "@/src/utils/helpers";
import { PaginationType } from "@/src/components/common/types/pagination.type";

export const CreateTaskAction = CreateServerAction(
  true,
  async (taskData: InsertTask) => {
    try {
      const existingTaskCountResult = await GetTaskCount(taskData.project_id)
      const taskCount = existingTaskCountResult + 1
      
      const project = await getProjectById(taskData.project_id)
      const titleInitials = getInitials(project.project_name)
      
      const task_num = `${titleInitials} - ${taskCount}`

      const task = await CreateTask({...taskData, task_num: task_num})
      return { success: true, data: task }
    } catch (error) {
      console.log(error)
      return { error:error }
    }
  }
)


export interface GetTaskResponseType {
  
  tasks: SelectTask[]
  pagination: PaginationType
}

export const GetTaskAction = CreateServerAction(
  true,
  async (filters?: taskQueryFilters) => {
    try{
      let tasks: GetTaskResponseType 
      
      tasks =  await GetTasks({...filters})

      return {success:true, data: tasks}

    }catch(error){
      return {error: error}
    }

  }
)


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