import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/src/components/ui/dialog'
import { GetTaskSatatusAction } from '@/src/server-actions/Tasks/Task'
import { projectStore } from '@/src/store/project/projectStore'
import { taskStatusesStore } from '@/src/store/taskstatuses/StatusesStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAtom } from 'jotai'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ScrollArea } from '@/src/components/ui/scroll-area'
import TaskForm from './TaskForm'
import TaskFormHeader from './TaskFormHeader'
import { taskStore } from '@/src/store/tasks/taskStore'

const ticketSchema = z.object({
  task_title: z.string().min(1, "Title required").max(50, "Title is too long"),
  description: z.string().min(1, "Title required").max(100, "Title is too long"),
  task_type: z.string().min(1, "Title required"),
  task_priority: z.string().min(1, "Title required"),
  story_points: z.string().optional(),
  status_id: z.string().optional()
})



function AddBabklogItem() {
  const [isTicketFormModelOpen, setIsTicketFormModelOpen] = useAtom(taskStore.isTaskFormModelOpen)
  const [editTask, setEditTask] = useState(false)
  const [selectedTask, setSelectedTask] = useAtom(taskStore.selectedTask)
  const [statuses, setStatuses] = useAtom(taskStatusesStore.statuses)

  const form = useForm({
    resolver: zodResolver(ticketSchema)
  })

  const projectId = useParams().id as string
  const backlogStatus = statuses.find(s => s.name === "Backlog")


  useEffect(() => {
    const fetchStatuses = async () => {
      const status = await GetTaskSatatusAction(projectId)
      if (status.success && status.data) {
        setStatuses(status.data)
      }
    }
    fetchStatuses()
  }, [isTicketFormModelOpen])


  useEffect(() => {
    if (!isTicketFormModelOpen) {
      form.reset(
        {
          task_title: "",
          description: "",
          task_type: "",
          task_priority: "",
          story_points: "",
          status_id: backlogStatus?.id
        }
      )
      form.clearErrors()
      setSelectedTask(null)
      setEditTask(false)
    }
  }, [isTicketFormModelOpen])

  useEffect(() => {
    if (selectedTask) {
      const status = statuses.find(s => s.id === selectedTask.status_id)
      setEditTask(true)
      form.setValue("task_title", selectedTask.task_title)
      form.setValue("description", selectedTask.description)
      form.setValue("task_type", selectedTask.task_type)
      form.setValue("task_priority", selectedTask.task_priority)
      form.setValue("story_points", selectedTask.story_points)
      form.setValue("status_id", status?.name)
    } else {
      setEditTask(false)
    }
  }, [selectedTask])

  // console.log(form.formState.errors)



  return (
    <Dialog open={isTicketFormModelOpen} onOpenChange={setIsTicketFormModelOpen}>
      <DialogContent className='sm:max-w-5xl [&>button]:w-6 [&>button]:h-6 [&>button>svg]:w-6 [&>button>svg]:h-6'>
        <DialogHeader>
          <TaskFormHeader selectedTask={selectedTask} />
          <DialogTitle className='h-0 absolute'></DialogTitle>
        </DialogHeader>
        <ScrollArea className=" max-h-[80vh] ">
          <TaskForm statuses={statuses} />
        </ScrollArea>
      </DialogContent>
    </Dialog >
  )
}

export default AddBabklogItem