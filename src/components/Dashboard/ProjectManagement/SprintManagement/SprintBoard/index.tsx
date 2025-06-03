"use client"
import React from "react"
import { useParams } from "next/navigation"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetSprintAction } from "@/src/server-actions/Sprint/sprint"
import { useAtom } from "jotai"
import { sprintStore } from "@/src/store/sprint/sprintsStore"
import Loader from "@/src/components/common/Loader/Loader"
import { useEffect, useState } from "react"
import SprintBoardCard from "./SprintBoardCard"

function SprintBoard() {
  const [sprintList, setSprintList] = useAtom(sprintStore.sprints)
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

  return (
    <>
      {getSprintLoading ? (
        <Loader />
      ) : (
        sprintList.map((sprint) => (
          <SprintBoardCard sprint={sprint} key={sprint.id} />
        ))
      )}
    </>
  )
}

export default SprintBoard
