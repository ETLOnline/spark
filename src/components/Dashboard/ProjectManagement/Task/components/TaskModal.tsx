import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { projectStore } from "@/src/store/project/projectStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtom, useAtomValue } from "jotai"
import { useParams } from "next/navigation"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { taskStore } from "@/src/store/tasks/taskStore"
import TaskFormHeader from "./TaskFormHeader"
import TaskForm from "./TaskForm"
import { InsertTask, SelectTask } from "@/src/db/schema"
import { userStore } from "@/src/store/user/userStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateTaskAction,
  UpdateTaskAction
} from "@/src/server-actions/Tasks/Task"
import { toast } from "@/src/hooks/use-toast"
import useTaskHook from "../hooks/useTaskHook"

interface TaskModalProps {
  isTaskModelOpen: boolean
  setIsTaskModelOpen: Dispatch<SetStateAction<boolean>>
  selectedTask?: SelectTask
  sprintId?: string
  onCreateComplete?: (task: SelectTask) => void
  onUpdateComplete?: (task: SelectTask) => void
}

const taskSchema = z.object({
  task_title: z.string().min(1, "Title required").max(50, "Title is too long"),
  description: z
    .string()
    .min(1, "Title required")
    .max(100, "Title is too long"),
  task_type: z.string().min(1, "Title required"),
  task_priority: z.string().min(1, "Title required"),
  story_points: z.string().optional(),
  status_id: z.string().optional()
})

export const TaskModal = ({
  isTaskModelOpen,
  setIsTaskModelOpen,
  selectedTask,
  onCreateComplete,
  onUpdateComplete,
  sprintId
}: TaskModalProps) => {
  const [statuses, setStatuses] = useAtom(projectStore.projectStatusList)
  const { createTaskLoading, updateTaskLoading, handleSubmit } = useTaskHook({
    selectedTask,
    sprintId,
    onCreateComplete,
    onUpdateComplete
  })

  return (
    <Dialog open={isTaskModelOpen} onOpenChange={setIsTaskModelOpen}>
      <DialogContent className="sm:max-w-5xl [&>button]:w-6 [&>button]:h-6 [&>button>svg]:w-6 [&>button>svg]:h-6">
        <DialogHeader>
          <TaskFormHeader selectedTask={selectedTask} />
          <DialogTitle className="h-0 absolute"></DialogTitle>
        </DialogHeader>
        <ScrollArea className=" max-h-[80vh] ">
          <TaskForm
            statuses={statuses}
            onSubmit={handleSubmit}
            selectedTask={selectedTask}
            loading={createTaskLoading || updateTaskLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
