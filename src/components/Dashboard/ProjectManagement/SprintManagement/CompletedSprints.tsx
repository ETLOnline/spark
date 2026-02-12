"use client"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetSprintAction } from "@/src/server-actions/Sprint/sprint"
import React, { useEffect, useState } from "react"
import SprintCardPage from "./SprintCard"
import NoDataCard from "../../Channels/ChannelDetails/NoDataCard"
import { SelectTask } from "@/src/db/schema"
import { ChartGantt } from "lucide-react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { GetSprintTasksAction } from "@/src/server-actions/Tasks/Task"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import PaginationComponent from "@/src/components/common/Pagination"
import { useAtom } from "jotai"
import { taskStore } from "@/src/store/tasks/taskStore"
import { TaskModal } from "../Task/components/TaskModal"
import { sprintStore } from "@/src/store/sprint/sprintsStore"
import { Button } from "@/src/components/ui/button"

function CompletedSprints() {
  const [getSprintLoading, , , GetSprints] = useServerAction(GetSprintAction)
  const [sprintList, setSprintList] = useAtom(sprintStore.sprints)
  const [tasks, setTasks] = useState<SelectTask[]>([])
  const [pagination, setPagination] = useState<PaginationType>()
  const [searchParamsPage, setSearchParamsPage] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useAtom(taskStore.selectedTask)
  const [isTaskModalOpen, setIsTaskModalOpen] = useAtom(
    taskStore.isTaskModalOpen
  )
  const [isNavigating, setIsNavigating] = useState(false)

  const projectId = useParams().id as string

  const searchParams = useSearchParams()

  const router = useRouter()

  useEffect(() => {
    if (searchParams.get("page")) {
      setSearchParamsPage(searchParams.get("page"))
    }
  }, [searchParams])

  const fetchCompletedSprints = async () => {
    const page = parseInt(searchParams.get("page") || "1", 10)
    const Sprints = await GetSprints({
      projectId: projectId,
      status: ["closed"],
      page: page ? page : 1,
      limit: 4
    })
    if (Sprints?.success && Sprints.data) {
      setSprintList(Sprints.data.sprints)
      setPagination(Sprints.data.pagination)
    }
  }

  useEffect(() => {
    if (!projectId) return
    fetchCompletedSprints()
  }, [projectId, searchParamsPage])

  const getSprintTasks = async () => {
    const res = await GetSprintTasksAction({
      project_id: projectId,
      sprint_ids: sprintList.map((sprint) => sprint.id)
    })
    if (res?.success && res.data) {
      setTasks(res.data.tasks)
    }
  }
  useEffect(() => {
    if (sprintList.length > 0) getSprintTasks()
  }, [sprintList])

  const handleGoToCurrentSprints = () => {
    setIsNavigating(true)
    router.push(`/project/${projectId}/sprint`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Sprints History</h2>
        <Button
          loading={isNavigating}
          variant="outline"
          onClick={handleGoToCurrentSprints}
        >
          Back to Active Sprints
        </Button>
      </div>

      <div className="space-y-4 print:space-y-3">
        {getSprintLoading ? (
          <div className="flex justify-center items-center my-6">
            <Loader size={LoaderSizes.lg} />
          </div>
        ) : sprintList.length > 0 ? (
          <>
            {sprintList.map((sprint) => (
              <SprintCardPage
                key={sprint.id}
                sprint={sprint}
                tasks={tasks}
                isSprintCompleted={true}
                isTaskModalOpen={isTaskModalOpen}
                setIsTaskModalOpen={setIsTaskModalOpen}
              />
            ))}

            {pagination && <PaginationComponent pagination={pagination} />}
          </>
        ) : (
          <NoDataCard
            title="No Sprints Found"
            description="Create a new sprint to start managing your project tasks."
            icon={<ChartGantt className="h-10 w-10 text-muted-foreground" />}
          />
        )}
      </div>

      <TaskModal
        selectedTask={selectedTask ?? undefined}
        isTaskModelOpen={isTaskModalOpen}
        setIsTaskModelOpen={setIsTaskModalOpen}
        isSprintCompleted={true}
      />
    </div>
  )
}

export default CompletedSprints
