import { execSync } from "child_process"
import fs from "fs"
import path from "path"
import readline from "readline"
import { CreateTask, GetTaskCount, GetTasks } from "../data-access/tasks/query"
import { InsertTask, taskTable } from "../schema"
import { db } from ".."
import { eq } from "drizzle-orm"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})


const askTargetProjectId = () => {
  return new Promise((resolve, reject) => {
    rl.question('Enter Target Project Id:  ', (answer) => {
      resolve(answer)
    })
  })
}

const askDestinationProjectId = () => {
  return new Promise((resolve, reject) => {
    rl.question('Enter destination Project Id:  ', (answer) => {
      resolve(answer)
    })
  })
}



const main = async () => {
	const tProjectId = await askTargetProjectId()
	const dProjectId = await askDestinationProjectId()

  if(!tProjectId || !dProjectId){
    console.log("Missing project id")
    return
  }

	const targetProjectTasksCount = await GetTaskCount(tProjectId as string)

  if(targetProjectTasksCount ===  0){
    console.log("No tasks to migrate")
    return
  }


  console.log(`Migrating ${targetProjectTasksCount} tasks from ${tProjectId} to ${dProjectId}`)

  const targetProjectTasks = await db.query.taskTable.findMany({
    where: eq(taskTable.project_id, tProjectId as string)
  })

  if((targetProjectTasks?.length ?? 0) > 0){
    const tasks = targetProjectTasks
    console.log(tasks.length)
    for(const task of tasks){
      const newTaskData: InsertTask = {
        task_title: task.task_title,
        description: task.description,
        task_type: task.task_type,
        task_priority: task.task_priority,
        story_points: task.story_points,
        project_id: dProjectId as string,
        created_by: task.created_by
      }
      
      const newTask = await CreateTask(newTaskData)
      
      console.log(`Migrated task ${task.task_num} to ${newTask?.task_num ?? ''}`) 
      // break;
    }

  }


	rl.close()
}

main()