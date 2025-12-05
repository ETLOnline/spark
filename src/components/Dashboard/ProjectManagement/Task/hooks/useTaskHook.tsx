import { Button } from "@/src/components/ui/button"
import { InsertTask, SelectTask } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateTaskAction,
  GetTaskByIdAction,
  UpdateTaskAction
} from "@/src/server-actions/Tasks/Task"
import { projectStore } from "@/src/store/project/projectStore"
import { userStore } from "@/src/store/user/userStore"
import { useAtom, useAtomValue } from "jotai"
import { useParams } from "next/navigation"

interface TaskHookProps {
  selectedTask?: SelectTask
  sprintId?: string
  onCreateComplete?: (task: SelectTask) => void
  onUpdateComplete?: (task: SelectTask) => void
  pageName?: string
  setIsTaskModelOpen?: (val: boolean) => void // <-- add this
  setSelectedTask?: (task: SelectTask | null) => void
}

const useTaskHook = ({
  selectedTask,
  sprintId,
  onCreateComplete,
  onUpdateComplete,
  pageName,
  setIsTaskModelOpen,
  setSelectedTask
}: TaskHookProps) => {
  const [statuses, setStatuses] = useAtom(projectStore.projectStatusList)

  const authUser = useAtomValue(userStore.AuthUser)
  const [createTaskLoading, createTaskData, createTaskError, CreateTask] =
    useServerAction(CreateTaskAction)
  const [updateTaskLoading, updateTaskData, updateTaskError, UpdateTask] =
    useServerAction(UpdateTaskAction)

  const projectId = useParams().id as string
  const toDoStatus = statuses.find((s) => s.name === "To Do")

  function handleSubmit(data: any) {
    if (!selectedTask) {
      if (!data.status_id) {
        data.status_id = toDoStatus?.id
      }
      handleCreateTask(data)
    } else {
      if (!statuses?.find((s) => s.id === data.status_id)) {
        data.status_id = selectedTask.status_id
      }
      handleUpdateTask(data)
    }
  }

  async function handleCreateTask(data: InsertTask) {
    try {
      if (!authUser) return

      const payload = {
        ...data,
        created_by: authUser.unique_id,
        project_id: projectId || "",
        sprint_id: sprintId || null,
        assign_to: data.assign_to || null,
        assign_by: data.assign_by || authUser.unique_id,
        parent_task_id: data.parent_task_id || null
      }

      const task = await CreateTask(payload, pageName)

      if (task?.success && task.data) {
        // 1️⃣ Call callback
        if (onCreateComplete) onCreateComplete(task.data)

        // 2️⃣ Close the modal immediately
        if (setIsTaskModelOpen) setIsTaskModelOpen(false)
        if (setSelectedTask) setSelectedTask(null)

        // 3️⃣ Show toast with button
        toast({
          title: "Task created successfully",
          description: (
            <div className="flex flex-col gap-2">
              <span>
                {" "}
                Task #{task.data.task_num} has been created. Click the button
                below to view it.
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  if (setSelectedTask) setSelectedTask(task.data as SelectTask)
                  if (setIsTaskModelOpen) setIsTaskModelOpen(true)
                }}
              >
                View Task
              </Button>
            </div>
          ),
          duration: 4000
        })
      } else {
        toast({
          title: "Unable to create task. Please try again.",
          variant: "destructive",
          duration: 2000
        })
      }
    } catch (err) {
      console.error("Error creating task:", err)
      toast({
        title: "Error creating task",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  async function handleUpdateTask(data: SelectTask) {
    try {
      if (selectedTask?.id) {
        const payload = {
          ...data,
          assign_to: data.assign_to || null,
          assign_by: data.assign_by || authUser?.unique_id,
          parent_task_id: data.parent_task_id || null
        }
        const updatedTask = await UpdateTask(selectedTask?.id, payload)
        if (updatedTask?.success && updatedTask.data) {
          if (onUpdateComplete) {
            onUpdateComplete(updatedTask?.data)
          }
          toast({
            title: "Task Updated successfully",
            description: "Your task has been updated",
            duration: 2000
          })
        }
      }
    } catch {
      toast({
        title: "Unable to Update Task",
        description: "Please try again.",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  return {
    handleSubmit,
    createTaskLoading,
    updateTaskLoading
  }
}

export default useTaskHook
