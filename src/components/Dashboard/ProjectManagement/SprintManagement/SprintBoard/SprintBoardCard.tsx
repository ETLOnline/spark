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
import BoardTaskCard from "./BoardTaskCard"
import { createPortal } from "react-dom"
import { toast } from "@/src/hooks/use-toast"
import { Skeleton } from "@/src/components/ui/skeleton"

interface Props {
  sprint: SelectSprint
  tasks: SelectTask[]
  // parent will open modal and set selected task so it can capture scroll before open
  onOpenTask?: (task: SelectTask) => void
}

function SprintBoardCard({ sprint, tasks, onOpenTask }: Props) {
  const projectStatusList = useAtomValue(projectStore.projectStatusList)
  const [filteredTasks, setFilteredTasks] = useState<SelectTask[]>([])
  const [filters, setFilters] = useState<TaskFiltersType | null>(null)
  const [activeTask, setActiveTask] = useState<SelectTask | null>(null)

  const [getTaskLoading, , , GetSPrintTask] =
    useServerAction(GetSprintTasksAction)

  useEffect(() => {
    if (tasks.length > 0) {
      setFilteredTasks(tasks.filter((task) => task.sprint_id === sprint.id))
    }
  }, [tasks])

  useEffect(() => {
    const getTask = async () => {
      if (sprint) {
        const tasks = await GetSPrintTask({
          project_id: sprint.projectId,
          sprint_id: sprint.id,
          priority: filters?.priority,
          type: filters?.type,
          status: filters?.status,
          assignee: filters?.assignee
        })
        if (tasks?.success && tasks.data) {
          setFilteredTasks(tasks.data.tasks)
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
    filters?.status
  ])

  function handleOnTaskClick(task: SelectTask) {
    onOpenTask?.(task)
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
    const task = filteredTasks.find((t) => t.id === taskId)
    setActiveTask(task || null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) {
      setActiveTask(null)
      return
    }

    const taskId = active.id
    const overStatusId = over.data?.current?.statusId

    let statusChanged = false
    let movedParent: any = null

    setFilteredTasks((prev) => {
      return prev.map((task) => {
        // update the dragged task’s status
        if (task.id === taskId && task.status_id !== overStatusId) {
          statusChanged = true
          movedParent = { ...task, status_id: overStatusId }
          return movedParent
        }

        // if this task is a child of the moved parent → update its embedded parentTask reference
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
      toast({
        title: "Task status updated successfully",
        duration: 2000
      })

      // update on server
      await UpdateTaskAction(taskId as string, {
        status_id: overStatusId as string
      })
    }

    setActiveTask(null)
  }

  return (
    <>
      <Card key={sprint.id} className="mb-6 ">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <CardTitle>{sprint.title}</CardTitle>
              <CardDescription>
                {new Date(sprint.start_date).toLocaleDateString()} -{" "}
                {new Date(sprint.end_date).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <Badge>Active</Badge>

              <TaskFilters
                projectId={sprint.projectId}
                onApplyFilters={HandleTaskFilters}
              />
            </div>
          </div>

          <SprintProgressBar
            tasks={filteredTasks}
            statuses={projectStatusList}
          />
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex overflow-x-auto  ">
              <div className="flex justify-between gap-2 w-full">
                {projectStatusList.map((status) => (
                  <BoardColumn
                    key={status.id}
                    sprint={sprint}
                    status={status}
                    tasks={filteredTasks}
                    onTaskClick={handleOnTaskClick}
                    setTasks={setFilteredTasks}
                  />
                ))}
              </div>
            </div>

            {createPortal(
              <DragOverlay>
                {activeTask ? (
                  <Skeleton className="h-[200px] w-full rounded-lg" />
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
    </>
  )
}

export default SprintBoardCard
