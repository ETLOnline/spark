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

function SprintBoard() {
  const [sprintList, setSprintList] = useAtom(sprintStore.sprints)
  const [getSprintLoading, , , GetSprints] = useServerAction(GetSprintAction)

  const projectStatusList = useAtomValue(projectStore.projectStatusList)
  const [openDialog, setOpenDialog] = useState(false)

  const projectId = useParams().id as string

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

  return projectStatusList.length > 0 ? (
    <>
      {getSprintLoading ? (
        <div className="flex items-center justify-center">
          <Loader size={LoaderSizes.lg} />
        </div>
      ) : sprintList.filter((s) => s.sprint_status === "active").length ===
        0 ? (
        <NoDataCard
          title="No Active Sprint"
          description="There are no active sprints for this project. Create and active a new sprint to get started."
          icon={<Kanban />}
        />
      ) : (
        sprintList
          .filter((s) => s.sprint_status === "active")
          .map((sprint) => <SprintBoardCard sprint={sprint} key={sprint.id} />)
      )}
    </>
  ) : (
    <StatusRequiredDialog openDialog={openDialog} />
  )
}

export default SprintBoard
