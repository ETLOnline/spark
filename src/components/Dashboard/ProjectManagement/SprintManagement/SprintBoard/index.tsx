"use client"
import React from "react"
import { useParams } from "next/navigation"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetSprintAction } from "@/src/server-actions/Sprint/sprint"
import { useAtom, useAtomValue } from "jotai"
import { sprintStore } from "@/src/store/sprint/sprintsStore"
import Loader from "@/src/components/common/Loader/Loader"
import { useEffect, useState } from "react"
import SprintBoardCard from "./SprintBoardCard"
import { projectStore } from "@/src/store/project/projectStore"
import StatusRequiredDialog from "../../StatusRequiredDialog"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import NoDataCard from "../../../Channels/ChannelDetails/NoDataCard"
import { Kanban } from "lucide-react"
import { TaskModal } from "../../Task/components/TaskModal"
import { SelectSprint, SelectTask } from "@/src/db/schema"
import { GetSprintTasksAction } from "@/src/server-actions/Tasks/Task"
import pusherClient from "@/src/services/realtime/PusherClient"
import { userStore } from "@/src/store/user/userStore"
import { taskStore } from "@/src/store/tasks/taskStore"

function SprintBoard() {
  const [sprintList, setSprintList] = useAtom(sprintStore.sprints)
  const [getSprintLoading, , , GetSprints] = useServerAction(GetSprintAction)

  const [tasks, setTasks] = useState<SelectTask[]>([])
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useAtom(taskStore.selectedTask)

  const [getTaskLoading, , , GetSPrintTask] =
    useServerAction(GetSprintTasksAction)

  const projectStatusList = useAtomValue(projectStore.projectStatusList)
  const [openDialog, setOpenDialog] = useState(false)
  const authUser = useAtomValue(userStore.AuthUser)
  const pusherChannel = useAtomValue(projectStore.pusherChannel)
  const [isInitailDataLoad, setIsInitailDataLoad] = useState(false)

  const projectId = useParams().id as string

  useEffect(() => {
    if (!pusherChannel || !authUser) return

    pusherChannel.bind("task-add", (newTask: SelectTask) => {
      if (authUser?.unique_id === newTask.created_by) return
      setTasks((tasks) => [...tasks, newTask])
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
      pusherChannel.unbind("task-add")
      pusherChannel.unbind("task-update")
      pusherChannel.unbind("task-delete")
    }
  }, [pusherChannel, authUser])

  useEffect(() => {
    if (projectStatusList.length === 0) {
      setOpenDialog(true)
    }
  }, [projectStatusList])

  useEffect(() => {
    if (tasks.length > 0) {
      setIsInitailDataLoad(true)
    }
  }, [tasks])

  useEffect(() => {
    if (!projectId) return

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

    return () => {
      channel.unbind_all()
      pusherClient.unsubscribe(channelName)
    }
  }, [projectId])

  useEffect(() => {
    const fetchSprints = async () => {
      const Sprints = await GetSprints({
        projectId: projectId,
        status: ["active"]
      })
      if (Sprints?.success && Sprints.data) {
        setSprintList(Sprints.data)
      }
    }
    fetchSprints()
  }, [projectId])

  useEffect(() => {
    if (!projectId || sprintList.length === 0) return
    const getTask = async () => {
      const tasks = await GetSPrintTask({
        project_id: projectId,
        sprint_ids: sprintList.map((s) => s.id)
      })
      if (tasks?.success && tasks.data) {
        setTasks(tasks.data.tasks)
      }
    }
    getTask()
  }, [projectId, sprintList])

  return projectStatusList.length > 0 ? (
    <>
      {getSprintLoading ? (
        <div className="flex items-center justify-center">
          <Loader size={LoaderSizes.lg} />
        </div>
      ) : sprintList.length === 0 ? (
        <NoDataCard
          title="No Active Sprint"
          description="There are no active sprints for this project. Create and active a new sprint to get started."
          icon={<Kanban />}
        />
      ) : (
        sprintList.map((sprint) => (
          <SprintBoardCard
            sprint={sprint}
            key={sprint.id}
            tasks={tasks}
            isTaskModalOpen={isTaskModalOpen}
            setIsTaskModalOpen={setIsTaskModalOpen}
            selectedTask={selectedTask}
            setSelectedTask={setSelectedTask}
          />
        ))
      )}

      <TaskModal
        isReady={isInitailDataLoad}
        isTaskModelOpen={isTaskModalOpen}
        setIsTaskModelOpen={setIsTaskModalOpen}
        selectedTask={selectedTask || undefined}
        onUpdateComplete={(task: SelectTask) => {
          setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)))
          setSelectedTask(task)
        }}
      />
    </>
  ) : (
    <StatusRequiredDialog openDialog={openDialog} />
  )
}

export default SprintBoard
