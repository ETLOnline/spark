"use client"

import { useParams } from "next/navigation"
import CreateSprintModal from "./CreateSprintModal"
import { useEffect, useState } from "react"
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
import { SelectTask } from "@/src/db/schema"
import { GetSprintTasksAction } from "@/src/server-actions/Tasks/Task"
import { TaskFiltersType } from "../types/taskFilters.type"
import { taskStore } from "@/src/store/tasks/taskStore"
import pusherClient from "@/src/services/realtime/PusherClient"
import { SelectSprint } from "@/src/db/schema"
import usePageName from "@/src/hooks/usePageName"
import { SitePageName } from "@/src/types/pageName"
import { userStore } from "@/src/store/user/userStore"

export function SprintManagement() {
  const [sprintList, setSprintList] = useAtom(sprintStore.sprints)
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)
  const projectStatusList = useAtomValue(projectStore.projectStatusList)
  const [openDialog, setOpenDialog] = useState(false)

  const [tasks, setTasks] = useState<SelectTask[]>([])
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<SelectTask | null>(null)
  const [getTaskLoading, , , GetTasks] = useServerAction(GetSprintTasksAction)
  const [sprintID, setSprintID] = useState<string>("")
  const [shouldRefetchTasks, setShouldRefetchTasks] = useAtom(
    taskStore.shouldRefetchTasks
  )

  const [getSprintLoading, , , GetSprints] = useServerAction(GetSprintAction)
  const { SetPageName, GetPageName } = usePageName()
  const [pusherChannel, setPusherChannel] = useAtom(sprintStore.pusherChannel)

  const projectId = useParams().id as string
  const pageName = GetPageName()

  useEffect(() => {
    SetPageName(SitePageName.Project_Sprint)
  }, [])

  useEffect(() => {
    if (!projectId || !pageName) return

    const channelName = `project-${projectId}-${pageName}`

    const channel = pusherClient.subscribe(channelName)
    setPusherChannel(channel)

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

    return () => {
      pusherClient.unsubscribe(`project-${projectId}-${pageName}`)
      channel.unbind_all()
      setPusherChannel(null)
    }
  }, [projectId, pageName])

  useEffect(() => {
    if (projectStatusList.length === 0) {
      setOpenDialog(true)
    }
  }, [projectStatusList])

  useEffect(() => {
    const fetchSprints = async () => {
      const Sprints = await GetSprints(projectId)
      if (Sprints?.success && Sprints.data) {
        setSprintList(Sprints.data)
      }
    }
    fetchSprints()
  }, [projectId])

  useEffect(() => {
    if (!shouldRefetchTasks) return
    const fetchTasks = async () => {
      const tasks = await GetTasks({
        project_id: projectId,
        sprint_ids: sprintList.map((s) => s.id)
      })
      if (tasks?.success && tasks.data) {
        setTasks(tasks.data.tasks)
      }
      setShouldRefetchTasks(false)
    }
    fetchTasks()
  }, [projectId, shouldRefetchTasks])

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
        pageName={pageName ?? ""}
        selectedTask={selectedTask ?? undefined}
        onCreateComplete={(task) => {
          setSelectedTask(task)
          setTasks((prevTasks) => [...prevTasks, task])
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
    </div>
  ) : (
    <StatusRequiredDialog openDialog={openDialog} />
  )
}
