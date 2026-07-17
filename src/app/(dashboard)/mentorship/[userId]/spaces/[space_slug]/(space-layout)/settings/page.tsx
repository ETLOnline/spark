import SpaceSettings from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/settings"
import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import { getFeaturesAction } from "@/src/server-actions/Feature/Feature"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
import React from "react"

interface Props {
  params: Promise<{
    userId: string
    space_slug: string
  }>
}

async function settingsPage({ params }: Props) {
  const { space_slug } = await params
  const decodedSpaceSlug = decodeURIComponent(space_slug)

  const currentSpace = await GetSpaceBySlugAction(decodedSpaceSlug, "")

  if (!currentSpace.success || !currentSpace.data) {
    return <NotFound />
  }

  const featuresList = await getFeaturesAction({
    feature_type: "space"
  })

  return (
    <SpaceSettings space={currentSpace.data} featuresList={featuresList.data} />
  )
}

export default settingsPage
