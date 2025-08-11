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
import { GetSprintTasksAction } from "@/src/server-actions/Tasks/Task"
import { TaskModal } from "../../Task/components/TaskModal"
import { TaskFiltersType } from "../../types/taskFilters.type"
import TaskFilters from "../../TaskFilter/TaskFilters"

interface Props {
  sprint: SelectSprint
  tasks: SelectTask[]
  isTaskModalOpen: boolean
  setIsTaskModalOpen: Dispatch<SetStateAction<boolean>>
  selectedTask: SelectTask | null | undefined
  setSelectedTask: Dispatch<SetStateAction<SelectTask | null | undefined>>
}

function SprintBoardCard({
  sprint,
  tasks,
  isTaskModalOpen,
  setIsTaskModalOpen,
  selectedTask,
  setSelectedTask
}: Props) {
  const projectStatusList = useAtomValue(projectStore.projectStatusList)
  const [filteredTasks, setFilteredTasks] = useState<SelectTask[]>([])
  const [filters, setFilters] = useState<TaskFiltersType>({})

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
          priority: filters.priority,
          type: filters.type,
          status: filters.status,
          assignee: filters.assignee
        })
        if (tasks?.success && tasks.data) {
          setFilteredTasks(tasks.data.tasks)
        }
      }
    }

    if (filters) {
      getTask()
    }
  }, [sprint, filters.assignee, filters.priority, filters.type, filters.status])

  function handleOnTaskClick(task: SelectTask) {
    setSelectedTask(task)
  }

  useEffect(() => {
    if (!isTaskModalOpen) {
      setSelectedTask(null)
    }
  }, [isTaskModalOpen])

  useEffect(() => {
    if (selectedTask) {
      setIsTaskModalOpen(true)
    }
  }, [selectedTask])

  function HandleTaskFilters(filters: TaskFiltersType) {
    setFilters(filters)
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
        </CardContent>
        <CardFooter>
          <SprintStatus />
        </CardFooter>
      </Card>

      <TaskModal
        isTaskModelOpen={isTaskModalOpen}
        setIsTaskModelOpen={setIsTaskModalOpen}
        selectedTask={selectedTask || undefined}
        onUpdateComplete={(task: SelectTask) => {
          setFilteredTasks((prev) =>
            prev.map((t) => (t.id === task.id ? task : t))
          )
          setSelectedTask(task)
        }}
      />
    </>
  )
}

export default SprintBoardCard
