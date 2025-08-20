"use client"

import { useParams } from "next/navigation"
import CreateSprintModal from "./CreateSprintModal"
import { useCallback, useEffect, useRef, useState } from "react"
import { useAtom, useAtomValue } from "jotai"
import { sprintStore } from "@/src/store/sprint/sprintsStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetSprintAction } from "@/src/server-actions/Sprint/sprint"
import SprintCardPage from "./SprintCard"
import { Button } from "@/src/components/ui/button"
import { ChartGantt, Plus } from "lucide-react"
import NoDataCard from "../../Channels/ChannelDetails/NoDataCard"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import StatusRequiredDialog from "../StatusRequiredDialog"
import { projectStore } from "@/src/store/project/projectStore"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { TaskModal } from "../Task/components/TaskModal"
import { SelectTask, SelectUser } from "@/src/db/schema"
import { GetSprintTasksAction } from "@/src/server-actions/Tasks/Task"
import { TaskFiltersType } from "../types/taskFilters.type"
import { taskStore } from "@/src/store/tasks/taskStore"
import pusherClient from "@/src/services/realtime/PusherClient"
import { SelectSprint } from "@/src/db/schema"
import { userStore } from "@/src/store/user/userStore"
import { set } from "zod"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import TaskMoveDialog from "../Task/components/task-move-dialog"

export function SprintManagement() {
  const [sprintList, setSprintList] = useAtom(sprintStore.sprints)
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)
  const projectStatusList = useAtomValue(projectStore.projectStatusList)
  const [openDialog, setOpenDialog] = useState(false)
  const authUser = useAtomValue(userStore.AuthUser)

  const [tasks, setTasks] = useState<SelectTask[]>([])
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useAtom(taskStore.selectedTask)
  const [selectedTasksForMove, setSelectedTasksForMove] = useAtom(
    taskStore.selectedSprintTask
  )

  const [getTaskLoading, , , GetTasks] = useServerAction(GetSprintTasksAction)
  const [sprintID, setSprintID] = useState<string>("")
  const pusherChannel = useAtomValue(projectStore.pusherChannel)
  const [isTaskMoveDialogOpen, setIsTaskMoveDialogOpen] = useAtom(
    taskStore.isTaskMoveDialogOpen
  )
  const [selectedSprint, setSelectedSprint] = useAtom(
    sprintStore.selectedSprint
  )
  const taskMoveDialogAction = useAtomValue(taskStore.taskMoveDialogAction)

  const [getSprintLoading, , , GetSprints] = useServerAction(GetSprintAction)

  const projectId = useParams().id as string

  // Get Sprints
  useEffect(() => {
    const fetchSprints = async () => {
      const Sprints = await GetSprints(projectId)
      if (Sprints?.success && Sprints.data) {
        setSprintList(Sprints.data)
      }
    }
    fetchSprints()
  }, [projectId])

  // Get Sprint's Tasks
  const fetchTasks = async () => {
    const tasksResponse = await GetTasks({
      project_id: projectId,
      sprint_ids: sprintList.map((s) => s.id)
    })
    if (tasksResponse?.success && tasksResponse.data.tasks) {
      setTasks(tasksResponse.data.tasks)
    }
  }

  useEffect(() => {
    if (projectId && sprintList.length > 0) {
      fetchTasks()
    }
  }, [projectId, sprintList])

  // Handle RealTime Updates
  const handleRealTimeTaskUpdate = useCallback(
    (newTask: SelectTask) => {
      if (authUser?.unique_id === newTask.created_by) {
        return
      }

      setTasks((prevTasks) => [...prevTasks, newTask])
    },
    [authUser]
  )

  useEffect(() => {
    if (!pusherChannel || !projectId || !authUser) return

    const channelName = `project-${projectId}-sprints`

    const channel = pusherClient.subscribe(channelName)

    channel.bind("sprint-add", (newSprint: SelectSprint) => {
      setSprintList((sprints) => {
        const sprintExists = sprints.some((s) => s.id === newSprint.id)

        return sprintExists ? sprints : [...sprints, newSprint]
      })
    })

    channel.bind("sprint-edit", (updatedSprint: SelectSprint) => {
      setSprintList((sprints) =>
        sprints.map((sprint) =>
          sprint.id === updatedSprint.id ? updatedSprint : sprint
        )
      )
    })

    channel.bind("sprint-delete", (deletedSprint: SelectSprint) => {
      setSprintList((sprints) =>
        sprints.filter((sprint) => sprint.id !== deletedSprint.id)
      )
    })

    pusherChannel.bind("task-add", (newTask: SelectTask) => {
      handleRealTimeTaskUpdate(newTask)
    })

    pusherChannel.bind("task-update", (updatedTask: SelectTask) => {
      if (authUser?.unique_id === updatedTask.created_by) return
      setTasks((tasks) =>
        tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t))
      )
    })

    pusherChannel.bind("task-delete", (deletedTask: SelectTask) => {
      if (authUser?.unique_id === deletedTask.created_by) return
      setTasks((tasks) => tasks.filter((t) => t.id !== deletedTask.id))
    })

    return () => {
      channel.unbind_all()
      pusherChannel.unbind_all()
      pusherClient.unsubscribe(`project-${projectId}-sprints`)
    }
  }, [projectId, authUser, pusherChannel])

  // Check if projectStatusList is empty
  useEffect(() => {
    if (projectStatusList.length === 0) {
      setOpenDialog(true)
    }
  }, [projectStatusList])

  useEffect(() => {
    if (!isTaskMoveDialogOpen) {
      setSelectedTasksForMove([])
      setSelectedSprint(null)
    }
  }, [isTaskMoveDialogOpen])

  function handleSetNewTasks(newTasks: SelectTask) {
    setSelectedTask(newTasks)
    setTasks((preTasks) => [...preTasks, newTasks])
  }

  // PERMISSIONS INITATE
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    projectId
  )
  const canCreate = permissionChecker
    ? permissionChecker?.canAccess("project.sprint.create")
    : false

  return projectStatusList.length > 0 ? (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Sprint Management</h2>
        {canCreate && (
          <Button onClick={() => setIsCreateSprintOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Sprint
          </Button>
        )}
      </div>

      <div className="space-y-4 print:space-y-3">
        {getSprintLoading ? (
          <div className="flex justify-center items-center">
            <Loader size={LoaderSizes.lg} />
          </div>
        ) : sprintList.length > 0 ? (
          sprintList
            .filter((s) => s.sprint_status !== "closed")
            .map((sprint) => (
              <SprintCardPage
                key={sprint.id}
                sprint={sprint}
                tasks={tasks}
                setSelectedTask={setSelectedTask}
                isTaskModalOpen={isTaskModalOpen}
                setIsTaskModalOpen={setIsTaskModalOpen}
                setTasks={setTasks}
                setSprintId={setSprintID}
                getTaskLoading={getTaskLoading}
              />
            ))
        ) : (
          <NoDataCard
            title="No Sprints Found"
            description="Create a new sprint to start managing your project tasks."
            icon={<ChartGantt className="h-10 w-10 text-muted-foreground" />}
          />
        )}
      </div>

      <CreateSprintModal
        isCreateSprintOpen={isCreateSprintOpen}
        setIsCreateSprintOpen={setIsCreateSprintOpen}
      />

      <TaskModal
        isTaskModelOpen={isTaskModalOpen}
        setIsTaskModelOpen={setIsTaskModalOpen}
        sprintId={sprintID}
        selectedTask={selectedTask ?? undefined}
        onCreateComplete={(newTask) => {
          handleSetNewTasks(newTask)
        }}
        onUpdateComplete={(task) => {
          setSelectedTask(task)
          setTasks((prevTasks) =>
            prevTasks.map((t) => {
              if (t.id === task.id) {
                return task
              }
              return t
            })
          )
        }}
      />

      <TaskMoveDialog
        isTaskMoveDialogOpen={isTaskMoveDialogOpen}
        setIsTaskMoveDialogOpen={setIsTaskMoveDialogOpen}
        task_ids={selectedTasksForMove.map((t) => t.id)}
        currSprintId={selectedSprint?.id}
        setTasks={setTasks}
        dialogAction={taskMoveDialogAction}
      />
    </div>
  ) : (
    <StatusRequiredDialog openDialog={openDialog} />
  )
}
