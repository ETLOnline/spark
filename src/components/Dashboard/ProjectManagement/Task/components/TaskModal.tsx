import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { projectStore } from "@/src/store/project/projectStore"
import { useAtom, useSetAtom } from "jotai"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState
} from "react"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import TaskFormHeader from "./TaskFormHeader"
import TaskForm from "./TaskForm"
import { SelectTask } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetTaskByIdAction } from "@/src/server-actions/Tasks/Task"
import { toast } from "@/src/hooks/use-toast"
import useTaskHook from "../hooks/useTaskHook"
import { taskStore } from "@/src/store/tasks/taskStore"
import { useConfirmClose } from "@/src/hooks/useConfirmClose"
import { UnsavedChangesDialog } from "@/src/components/common/unsavedChangesDialog"

interface TaskModalProps {
  isTaskModelOpen: boolean
  setIsTaskModelOpen: Dispatch<SetStateAction<boolean>>
  selectedTask?: SelectTask
  sprintId?: string
  onCreateComplete?: (task: SelectTask) => void
  onUpdateComplete?: (task: SelectTask) => void
  isReady?: boolean
  onSubTaskCreate?: (task: SelectTask) => void
  isSprintCompleted?: boolean
}

export const TaskModal = ({
  isTaskModelOpen,
  setIsTaskModelOpen,
  selectedTask,
  onCreateComplete,
  onUpdateComplete,
  sprintId,
  isReady,
  onSubTaskCreate,
  isSprintCompleted = false
}: TaskModalProps) => {
  const setSelectedTask = useSetAtom(taskStore.selectedTask)
  const [taskIdFromUrl, setTaskIdFromUrl] = useState<string | null>(null)
  const [statuses] = useAtom(projectStore.projectStatusList)
  const { createTaskLoading, updateTaskLoading, handleSubmit } = useTaskHook({
    selectedTask,
    sprintId,
    onCreateComplete: (task) => {
      onCreateComplete?.(task)
      setIsChanged(false)
    },
    onUpdateComplete: (task) => {
      onUpdateComplete?.(task)
      setIsChanged(false)
    }
  })

  const [isChanged, setIsChanged] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathName = usePathname()

  const [internalTask, setInternalTask] = useState<SelectTask | undefined>(
    selectedTask
  )

  const [loading, taskData, error, fetchTaskById] =
    useServerAction(GetTaskByIdAction)

  useEffect(() => {
    if (searchParams.get("task_id")) {
      setTaskIdFromUrl(searchParams.get("task_id"))
    }
  }, [searchParams])

  const fetchTask = async (taskId: string) => {
    try {
      const res = await fetchTaskById(taskId)
      if (res?.data) {
        setInternalTask(res.data)
        setSelectedTask(res.data)
        setIsTaskModelOpen(true)
      } else {
        toast({ title: "Task not found" })
        router.replace(pathName)
      }
    } catch (err) {
      console.error("Error fetching task:", err)
      toast({ title: "Failed to fetch task" })
      router.replace(pathName)
    }
  }

  useEffect(() => {
    if (!isReady) return

    if (!taskIdFromUrl || internalTask?.id === taskIdFromUrl) return

    fetchTask(taskIdFromUrl)
  }, [taskIdFromUrl, isReady])

  useEffect(() => {
    if (selectedTask) {
      setInternalTask(selectedTask)
    }
  }, [selectedTask])

  useEffect(() => {
    if (isTaskModelOpen && internalTask?.id) {
      router.push(
        pathName + "?" + new URLSearchParams({ task_id: internalTask.id })
      )
    }
  }, [isTaskModelOpen, internalTask?.id])

  const { showConfirmation, setShowConfirmation, handleClose } =
    useConfirmClose({
      isDirty: isChanged,
      onClose: () => {
        setIsTaskModelOpen(false)
        setInternalTask(undefined)
        setSelectedTask(null)
        setIsChanged(false)

        const newSearchParams = new URLSearchParams(searchParams.toString())
        newSearchParams.delete("task_id")

        setTimeout(() => {
          router.push(`${pathName}?${newSearchParams.toString()}`)
        }, 0)
      }
    })

  const isLoading = createTaskLoading || updateTaskLoading || loading

  return (
    <>
      <Dialog open={isTaskModelOpen} onOpenChange={handleClose}>
        <DialogContent
          className="sm:max-w-5xl [&>button]:w-6 [&>button]:h-6 [&>button>svg]:w-6 [&>button>svg]:h-6"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <TaskFormHeader selectedTask={internalTask} />
            <DialogTitle className="sr-only">
              {internalTask
                ? `Edit Task: ${internalTask.task_title}`
                : "Create New Task"}
            </DialogTitle>
          </DialogHeader>

          <TaskForm
            statuses={statuses}
            onSubmit={handleSubmit}
            selectedTask={internalTask}
            loading={isLoading}
            isTaskModelOpen={isTaskModelOpen}
            setIsChanged={setIsChanged}
            onSubTaskCreate={onSubTaskCreate}
          />
          <ScrollArea className="max-h-[80vh]">
            <TaskForm
              statuses={statuses}
              onSubmit={handleSubmit}
              selectedTask={internalTask}
              loading={isLoading}
              isTaskModelOpen={isTaskModelOpen}
              setIsChanged={setIsChanged}
              isSprintCompleted={isSprintCompleted}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        showConfirmation={showConfirmation}
        setShowConfirmation={setShowConfirmation}
        setIsActualDialogOpen={setIsTaskModelOpen}
      />
    </>
  )
}
