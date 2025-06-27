"use client"
import { SelectTask, SelectTaskStatus } from "@/src/db/schema"
import React, { useEffect, useState } from "react"
import TaskFormHeader from "./TaskFormHeader"
import TaskForm from "./TaskForm"
import useTaskHook from "../hooks/useTaskHook"

interface Props {
  statuses: SelectTaskStatus[]
  task: SelectTask | undefined
}

function TaskScreenPage({ statuses, task }: Props) {
  const [selectedTask, setSelectedTask] = useState<SelectTask | null>(null)
  
  const onCreateComplete = (task: SelectTask) => {
    setSelectedTask(task)
  }
  
  const onUpdateComplete = (task: SelectTask) => {
    setSelectedTask(task)
  }

  const {handleSubmit, createTaskLoading, updateTaskLoading} = useTaskHook({selectedTask: selectedTask ?? undefined , onCreateComplete, onUpdateComplete, sprintId: task?.sprint_id ?? undefined})

  useEffect(() => {
    if (task) {
      setSelectedTask(task)
    }
  }, [task])

  return (
    <>
      <TaskFormHeader selectedTask={selectedTask ?? undefined} />
      <TaskForm  loading={createTaskLoading || updateTaskLoading} onSubmit={handleSubmit} selectedTask={selectedTask ?? undefined} statuses={statuses} />
    </>
  )
}

export default TaskScreenPage
