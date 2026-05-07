import { Badge } from "@/src/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import SprintProgressBar from "./SprintProgressBar"
import SprintStatus from "./SprintStatus"
import BoardColumn from "./BoardColumn"
import { SelectSprint, SelectTask } from "@/src/db/schema"
import { useAtomValue } from "jotai"
import { projectStore } from "@/src/store/project/projectStore"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetSprintTasksAction,
  UpdateTaskAction
} from "@/src/server-actions/Tasks/Task"
import { TaskFiltersType } from "../../types/taskFilters.type"
import TaskFilters from "../../TaskFilter/TaskFilters"
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from "@dnd-kit/core"
import { createPortal } from "react-dom"
import { toast } from "@/src/hooks/use-toast"
import { Skeleton } from "@/src/components/ui/skeleton"
import { TaskType } from "../../constants/projectManagment"
import { filterTasks } from "../../utils/helper"

interface Props {
  sprint: SelectSprint
  tasks: SelectTask[]
  verificationMap: Record<
    string,
    { status: string; verification_id: number; feedback: string | null }
  >
  isTaskModalOpen: boolean
  setIsTaskModalOpen: Dispatch<SetStateAction<boolean>>
  selectedTask: SelectTask | null
  setSelectedTask: Dispatch<SetStateAction<SelectTask | null>>
  setTasks: Dispatch<SetStateAction<SelectTask[]>>
  onTaskVerificationRefresh?: (taskId: string) => void | Promise<void>
}

function SprintBoardCard({
  sprint,
  tasks,
  verificationMap,
  isTaskModalOpen,
  setIsTaskModalOpen,
  selectedTask,
  setSelectedTask,
  setTasks,
  onTaskVerificationRefresh
}: Props) {
  const projectStatusList = useAtomValue(projectStore.projectStatusList)
  const [filters, setFilters] = useState<TaskFiltersType | null>(null)
  const [activeTask, setActiveTask] = useState<SelectTask | null>(null)

  const [getTaskLoading, , , GetSPrintTask] =
    useServerAction(GetSprintTasksAction)

  useEffect(() => {
    if (!sprint.id || !filters) return

    const filtered = filterTasks(tasks, sprint.id, filters)
    setTasks(filtered)
  }, [sprint.id, filters])

  useEffect(() => {
    const getTask = async () => {
      if (sprint) {
        const tasks = await GetSPrintTask({
          project_id: sprint.projectId,
          sprint_id: sprint.id,
          priority: filters?.priority,
          type: filters?.type,
          status: filters?.status,
          assignee: filters?.assignee,
          creator: filters?.creator,
          excludedTypes: [TaskType.EPIC]
        })
        if (tasks?.success && tasks.data) {
          setTasks(tasks.data.tasks)
        }
      }
    }

    if (filters) {
      getTask()
    }
  }, [
    sprint,
    filters?.assignee,
    filters?.priority,
    filters?.type,
    filters?.status,
    filters?.creator
  ])

  function handleOnTaskClick(task: SelectTask) {
    setSelectedTask(task)
    setIsTaskModalOpen(true)
  }

  function HandleTaskFilters(filters: TaskFiltersType) {
    setFilters(filters)
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15
      }
    })
  )

  function handleDragStart(event: any) {
    const taskId = event.active.id
    const task = tasks.find((t) => t.id === taskId)
    setActiveTask(task || null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) {
      setActiveTask(null)
      return
    }

    const taskId = active.id as string
    const overStatusId = over.data?.current?.statusId as string

    let statusChanged = false
    let movedParent: any = null
    let prevStatusId: string | null = null

    setTasks((prev) => {
      return prev.map((task) => {
        if (task.id === taskId && task.status_id !== overStatusId) {
          prevStatusId = task.status_id
          statusChanged = true
          movedParent = { ...task, status_id: overStatusId }
          return movedParent
        }

        if (task.parent_task_id === taskId && task.parentTask) {
          return {
            ...task,
            parentTask: {
              ...task.parentTask,
              status_id: overStatusId
            }
          }
        }

        return task
      })
    })

    if (statusChanged) {
      try {
        const res = await UpdateTaskAction(taskId, {
          status_id: overStatusId
        })

        if (res?.success && res.data) {
          toast({
            title: `Task #${res.data.task_num} status updated successfully`,
            duration: 2000
          })

          onTaskVerificationRefresh?.(taskId)
        }
      } catch (error) {
        setTasks((prev) => {
          return prev.map((task) => {
            if (task.id === taskId && prevStatusId) {
              return { ...task, status_id: prevStatusId }
            }

            return task
          })
        })

        toast({
          title: "Failed to update task status",
          variant: "destructive",
          duration: 2000
        })
      }
    }

    setActiveTask(null)
  }

  return (
    <div className="px-0 sm:px-2">
      <Card key={sprint.id} className="mb-6 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="w-full xl:w-auto">
              <CardTitle className="text-xl">{sprint.title}</CardTitle>
              <CardDescription>
                {new Date(sprint.start_date).toLocaleDateString()} -{" "}
                {new Date(sprint.end_date).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto mt-2 xl:mt-0">
              <Badge className="w-fit self-start sm:self-auto">Active</Badge>

              <div className="w-full sm:w-auto">
                <TaskFilters
                  projectId={sprint.projectId}
                  onApplyFilters={HandleTaskFilters}
                />
              </div>
            </div>
          </div>

          <SprintProgressBar tasks={tasks} statuses={projectStatusList} />
        </CardHeader>
        <CardContent className="p-2 sm:p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
              <div className="flex gap-4 min-w-full px-2 sm:px-0">
                {projectStatusList.map((status) => (
                  <BoardColumn
                    key={status.id}
                    sprint={sprint}
                    status={status}
                    tasks={tasks}
                    verificationMap={verificationMap}
                    onTaskClick={handleOnTaskClick}
                    setTasks={setTasks}
                  />
                ))}
              </div>
            </div>

            {createPortal(
              <DragOverlay>
                {activeTask ? (
                  <Skeleton className="h-[100px] w-full rounded-lg" />
                ) : null}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        </CardContent>
        <CardFooter>
          <SprintStatus />
        </CardFooter>
      </Card>
    </div>
  )
}

export default SprintBoardCard
