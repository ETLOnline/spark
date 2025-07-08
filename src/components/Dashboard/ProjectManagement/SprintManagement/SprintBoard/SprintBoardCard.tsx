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
import { useEffect, useState } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetSprintTasksAction } from "@/src/server-actions/Tasks/Task"
import { TaskModal } from "../../Task/components/TaskModal"

interface Props {
  sprint: SelectSprint
}

function SprintBoardCard({ sprint }: Props) {
  const projectStatusList = useAtomValue(projectStore.projectStatusList)
  const [tasks, setTasks] = useState<SelectTask[]>([])
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<SelectTask | null>()

  const [getTaskLoading, , , GetSPrintTask] =
    useServerAction(GetSprintTasksAction)

  useEffect(() => {
    const getTask = async () => {
      if (sprint) {
        const tasks = await GetSPrintTask({ sprint_id: sprint.id })
        if (tasks?.success && tasks.data) {
          setTasks(tasks.data.tasks)
        }
      }
    }
    getTask()
  }, [sprint])

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
            </div>
          </div>

          <SprintProgressBar tasks={tasks} statuses={projectStatusList} />
        </CardHeader>
        <CardContent>
          <div className="flex overflow-x-auto  ">
            <div className="flex justify-between w-full">
              {projectStatusList.map((status) => (
                <BoardColumn
                  key={status.id}
                  sprint={sprint}
                  status={status}
                  tasks={tasks}
                  onTaskClick={handleOnTaskClick}
                  setTasks={setTasks}
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
          setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
          setSelectedTask(task)
        }}
      />
    </>
  )
}

export default SprintBoardCard
