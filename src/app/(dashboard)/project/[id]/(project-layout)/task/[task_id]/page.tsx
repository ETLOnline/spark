import TaskScreenPage from "@/src/components/Dashboard/ProjectManagement/Task/components/TaskScreen"
import { ScrollArea } from "@/src/components/ui/scroll-area"
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
    <ScrollArea className="min-h-full px-2">
      <TaskScreenPage
        statuses={projectStatusList.data || []}
        task={currTask.data}
      />
    </ScrollArea>
  )
}

export default page
