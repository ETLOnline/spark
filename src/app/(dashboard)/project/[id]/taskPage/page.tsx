import TaskScreenPage from '@/src/components/Dashboard/ProjectManagement/BacklogManagement/TaskScreen'
import { GetTaskByIdAction, GetTaskStatusAction } from '@/src/server-actions/Tasks/Task'
import React from 'react'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    task: string
  }>
}

async function page({ params, searchParams }: Props) {


  const { id } = await params
  const projectId = id

  const task_Id = await searchParams
  const taskId = task_Id.task

  const projectStatusList = await GetTaskStatusAction(projectId)

  const currTask = await GetTaskByIdAction(taskId)


  return (
    <TaskScreenPage statuses={projectStatusList.data || []} task={currTask.data} />
  )
}

export default page 