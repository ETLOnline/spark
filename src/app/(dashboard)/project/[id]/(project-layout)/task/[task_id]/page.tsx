import TaskScreenPage from "@/src/components/Dashboard/ProjectManagement/Task/components/TaskScreen"
import {
  GetTaskByIdAction,
  GetTaskStatusAction
} from "@/src/server-actions/Tasks/Task"
import React from "react"

interface Props {
  params: Promise<{
    id: string
    task_id: string
  }>
}

async function page({ params }: Props) {
  const projectId = (await params).id
  const taskId = (await params).task_id

  const projectStatusList = await GetTaskStatusAction(projectId)

  const currTask = await GetTaskByIdAction(taskId)

  return (
    <TaskScreenPage
      statuses={projectStatusList.data || []}
      task={currTask.data}
    />
  )
}

export default page
