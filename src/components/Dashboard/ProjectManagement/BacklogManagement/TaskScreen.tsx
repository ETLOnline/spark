'use client'
import { SelectTask, SelectTaskStatus } from '@/src/db/schema'
import React, { useEffect } from 'react'
import TaskFormHeader from './TaskFormHeader'
import TaskForm from './TaskForm'
import { useAtom } from 'jotai'
import { projectStore } from '@/src/store/project/projectStore'
import { taskStore } from '@/src/store/tasks/taskStore'



interface Props {
  statuses: SelectTaskStatus[]
  task: SelectTask | undefined
}

function TaskScreenPage({ statuses, task }: Props) {
  const [selectedTask, setSelectedTask] = useAtom(taskStore.selectedTask)

  useEffect(() => {
    if (task) {
      setSelectedTask(task)
    }
  }, [task])

  return (
    <>
      <TaskFormHeader selectedTask={selectedTask} />
      <TaskForm statuses={statuses} />
    </>
  )
}

export default TaskScreenPage