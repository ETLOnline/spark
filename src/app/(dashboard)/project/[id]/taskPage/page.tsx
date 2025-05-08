import TaskScreenPage from '@/src/components/Dashboard/ProjectManagement/BacklogManagement/TaskScreen'
import { GetTaskByIdAction, GetTaskSatatusAction } from '@/src/server-actions/Tasks/Task'
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

  const status = await GetTaskSatatusAction(projectId)

  const task = await GetTaskByIdAction(taskId)


  return (
    <TaskScreenPage statuses={status.data || []} task={task.data} />
  )
}

export default page 