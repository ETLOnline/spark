import { InsertTask, SelectTask } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { CreateTaskAction, UpdateTaskAction } from "@/src/server-actions/Tasks/Task"
import { projectStore } from "@/src/store/project/projectStore"
import { userStore } from "@/src/store/user/userStore"
import { useAtom, useAtomValue } from "jotai"
import { useParams } from "next/navigation"

interface TaskHookProps {
  selectedTask?: SelectTask
  sprintId?: string
  onCreateComplete?: (task: SelectTask) => void
  onUpdateComplete?: (task: SelectTask) => void
}

const useTaskHook = ({ selectedTask, sprintId, onCreateComplete, onUpdateComplete}: TaskHookProps) => {

  const [statuses, setStatuses] = useAtom(projectStore.projectStatusList)

  const authUser = useAtomValue(userStore.AuthUser)
  const [createTaskLoading, createTaskData, createTaskError, CreateTask] =
    useServerAction(CreateTaskAction)
  const [updateTaskLoading, updateTaskData, updateTaskError, UpdateTask] =
    useServerAction(UpdateTaskAction)


  const projectId = useParams().id as string
  const backlogStatus = statuses.find((s) => s.name === "Backlog")

  function handleSubmit(data: any) {
    if (!selectedTask) {
      if (!data.status_id) {
        data.status_id = backlogStatus?.id
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
      if (authUser) {
        const payload = {
          ...data,
          created_by: authUser?.unique_id,
          project_id: projectId || "",
          sprint_id: sprintId || null
        }
        const task = await CreateTask(payload)
        if (task?.success && task.data) {
          if(onCreateComplete){
            onCreateComplete(task.data)
          }
          toast({
            title: "Task created successfully",
            description: "Your new task has been added to the project",
            duration: 2000
          })
        } else {
          toast({
            title: "Unable to create task.Please try again.",
            variant: "destructive",
            duration: 2000
          })
        }
      }
    } catch {
      console.log("Error in creating task")
    }
  }

  async function handleUpdateTask(data: SelectTask) {
    try {
      if (selectedTask?.id) {
        const updatedTask = await UpdateTask(selectedTask?.id, data)
        if (updatedTask?.success && updatedTask.data) {
          if(onUpdateComplete){
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
    updateTaskLoading,
  }
}

export default useTaskHook