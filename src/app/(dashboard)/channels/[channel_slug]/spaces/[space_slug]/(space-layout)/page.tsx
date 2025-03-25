import NotFound from '@/src/components/Dashboard/NotFound/NotFound'
import { getFeaturesAction } from '@/src/server-actions/Feature/Feature'
import { GetSpaceBySlugAction } from '@/src/server-actions/Space/Space'
import React from 'react'
import SpaceFeatures from './components/space-features'

interface Props {
  params: Promise<{
    channel_slug: string
    space_slug: string
  }>
}

async function SpacePage({ params }: Props) {
  const { channel_slug, space_slug } = await params


  const currentSpace = await  GetSpaceBySlugAction(space_slug, channel_slug)

  if (!currentSpace.success || !currentSpace.data) {
    return (
      <NotFound/>
    )
  }

  const featuresList = await getFeaturesAction({
    feature_type: 'space'
  })

  if (!featuresList.success || !featuresList.data || !currentSpace.data.features.length) {
    return (
      <>No features found</>
    )
  }

  return (
    <SpaceFeatures features={currentSpace?.data?.features || []} space={currentSpace.data} />
  )
}

export default SpacePage