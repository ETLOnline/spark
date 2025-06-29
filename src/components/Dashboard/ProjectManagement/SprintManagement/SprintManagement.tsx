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
import { projectStore } from "@/src/store/project/projectStore"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

export function SprintManagement() {
  const [sprintList, setSprintList] = useAtom(sprintStore.sprints)
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false)

  const [getSprintLoading, , , GetSprints] = useServerAction(GetSprintAction)

  const projectId = useParams().id as string

  useEffect(() => {
    const fetchSprints = async () => {
      const Sprints = await GetSprints(projectId)
      if (Sprints?.success && Sprints.data) {
        setSprintList(Sprints.data)
      }
    }
    fetchSprints()
  }, [projectId])

  // PERMISSIONS INITATE
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    projectId
  )
  const canCreate = permissionChecker
    ? permissionChecker?.canAccess("project.sprint.create")
    : false

  return (
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
          sprintList.map((sprint) => (
            <SprintCardPage key={sprint.id} sprint={sprint} />
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
    </div>
  )
}
