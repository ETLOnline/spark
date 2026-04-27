"use client"
import { SelectTask, SelectTaskStatus } from "@/src/db/schema"
import React, { useEffect, useState } from "react"
import TaskFormHeader from "./TaskFormHeader"
import TaskForm from "./TaskForm"
import useTaskHook from "../hooks/useTaskHook"
import { GetTaskVerificationStatusAction } from "@/src/server-actions/Tasks/Task"

interface Props {
  statuses: SelectTaskStatus[]
  task: SelectTask | undefined
}

interface VerificationEntry {
  status: string
  verification_id: number
  feedback: string | null
}

function TaskScreenPage({ statuses, task }: Props) {
  const [selectedTask, setSelectedTask] = useState<SelectTask | null>(null)
  const [refetchComments, setRefetchComments] = useState(false)
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationEntry | null>(null)

  const fetchVerificationStatus = async (taskId: string) => {
    const res = await GetTaskVerificationStatusAction(taskId)
    if (res?.success) {
      setVerificationStatus(res.data ?? null)
    }
  }

  const onCreateComplete = (task: SelectTask) => {
    setSelectedTask(task)
  }

  const onUpdateComplete = (task: SelectTask) => {
    setSelectedTask(task)
    setRefetchComments(true)
    if (task?.id) fetchVerificationStatus(task.id)
  }

  const { handleSubmit, createTaskLoading, updateTaskLoading } = useTaskHook({
    selectedTask: selectedTask ?? undefined,
    onCreateComplete,
    onUpdateComplete,
    sprintId: task?.sprint_id ?? undefined
  })

  const handleVerificationStatusChange = (
    newStatus: string,
    newFeedback: string
  ) => {
    setVerificationStatus((prev) =>
      prev ? { ...prev, status: newStatus, feedback: newFeedback } : prev
    )
  }

  useEffect(() => {
    if (task) {
      setSelectedTask(task)
      fetchVerificationStatus(task.id)
    }
  }, [task])

  return (
    <div className="flex flex-col gap-4">
      <TaskFormHeader selectedTask={selectedTask ?? undefined} />
      <TaskForm
        loading={createTaskLoading || updateTaskLoading}
        onSubmit={handleSubmit}
        selectedTask={selectedTask ?? undefined}
        statuses={statuses}
        refetchComments={refetchComments}
        setRefetchComments={setRefetchComments}
        verificationStatus={verificationStatus}
        onVerificationStatusChange={handleVerificationStatusChange}
      />
    </div>
  )
}

export default TaskScreenPage
