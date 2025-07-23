import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { projectStore } from "@/src/store/project/projectStore"
import { useAtom } from "jotai"
import { useSearchParams, useRouter } from "next/navigation"
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

interface TaskModalProps {
  isTaskModelOpen: boolean
  setIsTaskModelOpen: Dispatch<SetStateAction<boolean>>
  selectedTask?: SelectTask
  sprintId?: string
  onCreateComplete?: (task: SelectTask) => void
  onUpdateComplete?: (task: SelectTask) => void
}

export const TaskModal = ({
  isTaskModelOpen,
  setIsTaskModelOpen,
  selectedTask,
  onCreateComplete,
  onUpdateComplete,
  sprintId
}: TaskModalProps) => {
  const [statuses] = useAtom(projectStore.projectStatusList)
  const { createTaskLoading, updateTaskLoading, handleSubmit } = useTaskHook({
    selectedTask,
    sprintId,
    onCreateComplete,
    onUpdateComplete
  })

  const searchParams = useSearchParams()
  const router = useRouter()
  const taskIdFromUrl = searchParams.get("task_id")

  const [internalTask, setInternalTask] = useState<SelectTask | undefined>(
    selectedTask
  )
  const [hasFetchedFromUrl, setHasFetchedFromUrl] = useState(false)
  const [hasModifiedUrl, setHasModifiedUrl] = useState(false)

  const [loading, taskData, error, fetchTaskById] =
    useServerAction(GetTaskByIdAction)

  useEffect(() => {
    const fetchTask = async () => {
      if (
        !taskIdFromUrl ||
        hasFetchedFromUrl ||
        internalTask?.id === taskIdFromUrl ||
        isTaskModelOpen
      )
        return

      setHasFetchedFromUrl(true)
      try {
        const res = await fetchTaskById(taskIdFromUrl)
        if (res?.data) {
          setInternalTask(res.data)
          setIsTaskModelOpen(true)
        } else {
          toast({ title: "Task not found" })
          router.replace("?", { scroll: false })
        }
      } catch (err) {
        console.error("Error fetching task:", err)
        toast({ title: "Failed to fetch task" })
        router.replace("?", { scroll: false })
      }
    }

    fetchTask()
  }, [
    taskIdFromUrl,
    hasFetchedFromUrl,
    internalTask?.id,
    fetchTaskById,
    setIsTaskModelOpen,
    isTaskModelOpen,
    router
  ])

  useEffect(() => {
    if (selectedTask && selectedTask.id !== internalTask?.id) {
      setInternalTask(selectedTask)
      setHasFetchedFromUrl(false)
    }
  }, [selectedTask, internalTask?.id])

  useEffect(() => {
    if (
      isTaskModelOpen &&
      internalTask?.id &&
      !taskIdFromUrl &&
      !hasModifiedUrl
    ) {
      const url = new URL(window.location.href)
      url.searchParams.set("task_id", internalTask.id)
      window.history.pushState({}, "", url.toString())
      setHasModifiedUrl(true)
    }
  }, [isTaskModelOpen, internalTask?.id, taskIdFromUrl, hasModifiedUrl])

  const handleModalClose = useCallback(
    (open: boolean) => {
      if (!open) {
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href)
          url.searchParams.delete("task_id")
          window.history.replaceState({}, "", url.toString())
        }

        setInternalTask(undefined)
        setHasFetchedFromUrl(true)
        setHasModifiedUrl(false)
      }

      setIsTaskModelOpen(open)
    },
    [setIsTaskModelOpen]
  )

  const isLoading = createTaskLoading || updateTaskLoading || loading

  return (
    <Dialog open={isTaskModelOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-5xl [&>button]:w-6 [&>button]:h-6 [&>button>svg]:w-6 [&>button>svg]:h-6">
        <DialogHeader>
          <TaskFormHeader selectedTask={internalTask} />
          <DialogTitle className="sr-only">
            {internalTask
              ? `Edit Task: ${internalTask.task_title}`
              : "Create New Task"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <TaskForm
            statuses={statuses}
            onSubmit={handleSubmit}
            selectedTask={internalTask}
            loading={isLoading}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
