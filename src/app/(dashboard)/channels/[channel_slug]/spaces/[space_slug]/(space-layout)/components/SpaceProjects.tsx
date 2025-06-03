"use client"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useSetAtom } from "jotai"
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useLayoutEffect } from "react"

const SpaceProjects = () => {
  const setLayoutStatsVisibility = useSetAtom(spaceStore.layoutStatsVisibility)
  const params = useParams()
  const router = useRouter()

  const spaceSlug = params.space_slug as string
  const channelSlug = params.channel_slug as string

  useLayoutEffect(() => {
    setLayoutStatsVisibility(false)
  }, [])

  useEffect(() => {
    if (spaceSlug && channelSlug) {
      setTimeout(() => {
        router.push(`/project?channel=${channelSlug}&space=${spaceSlug}`)
      }, 1000)
    }
  }, [spaceSlug, channelSlug])

  return (
    <NoDataCard
      icon={<Loader size={LoaderSizes.lg} />}
      title="Launching your projects"
      description="Redirecting you to the project management page"
    />
  )
}

export default SpaceProjects
