import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import { getFeaturesAction } from "@/src/server-actions/Feature/Feature"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
import React from "react"
import SpaceFeatures from "@/src/app/(dashboard)/channels/[channel_slug]/spaces/[space_slug]/(space-layout)/components/SpaceFeatures"

interface Props {
  params: Promise<{
    userId: string
    space_slug: string
  }>
}

async function SpacePage({ params }: Props) {
  const { space_slug } = await params
  const decodedSpaceSlug = decodeURIComponent(space_slug)

  const currentSpace = await GetSpaceBySlugAction(decodedSpaceSlug, "", true)

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
