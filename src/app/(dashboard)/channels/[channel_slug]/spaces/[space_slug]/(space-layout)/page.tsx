import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import { getFeaturesAction } from "@/src/server-actions/Feature/Feature"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
import React from "react"
import SpaceFeatures from "./components/SpaceFeatures"

interface Props {
  params: Promise<{
    channel_slug: string
    space_slug: string
  }>
}

async function SpacePage({ params }: Props) {
  const { channel_slug, space_slug } = await params

  const decodedChannelSlug = decodeURIComponent(channel_slug)
  const decodedSpaceSlug = decodeURIComponent(space_slug)

  const currentSpace = await GetSpaceBySlugAction(
    decodedSpaceSlug,
    decodedChannelSlug,
    true
  )

  if (!currentSpace.success || !currentSpace.data) {
    return <NotFound />
  }

  const featuresList = await getFeaturesAction({
    feature_type: "space"
  })

  return (
    <SpaceFeatures
      features={currentSpace?.data?.features || []}
      space={currentSpace.data}
    />
  )
}

export default SpacePage
