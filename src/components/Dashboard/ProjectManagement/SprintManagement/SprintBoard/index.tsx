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
        <Loader />
      ) : (
        sprintList.map((sprint) => (
          <SprintBoardCard sprint={sprint} key={sprint.id} />
        ))
      )}
    </>
  ) : (
    <StatusRequiredDialog openDialog={openDialog} />
  )
}

export default SprintBoard
