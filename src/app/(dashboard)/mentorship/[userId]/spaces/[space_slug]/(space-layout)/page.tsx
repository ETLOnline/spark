import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { getFeaturesAction } from "@/src/server-actions/Feature/Feature"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
import { GetSessionRequestById } from "@/src/db/data-access/mentor/query"
import React from "react"
import SpaceFeatures from "@/src/app/(dashboard)/channels/[channel_slug]/spaces/[space_slug]/(space-layout)/components/SpaceFeatures"

interface Props {
  params: Promise<{
    userId: string
    space_slug: string
  }>
  searchParams: Promise<{ session?: string }>
}

async function SpacePage({ params, searchParams }: Props) {
  const { space_slug } = await params
  const { session } = await searchParams
  const decodedSpaceSlug = decodeURIComponent(space_slug)

  const currentSpace = await GetSpaceBySlugAction(decodedSpaceSlug, "", true)

  if (!currentSpace.success || !currentSpace.data) {
    return <NotFound />
  }

  if (session) {
    const sessionReq = await GetSessionRequestById(Number(session))
    if (sessionReq?.is_space_archived) {
      return (
        <NoDataCard
          title="This space has been archived"
          description="This mentoring session has been completed, and the mentor has archived the space. The space is now disabled."
        />
      )
    }
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
