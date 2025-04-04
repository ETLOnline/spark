import NotFound from '@/src/components/Dashboard/NotFound/NotFound'
import { ProjectScreen } from '@/src/components/Dashboard/Projects'
import { GetSpaceBySlugAction } from '@/src/server-actions/Space/Space'
import React from 'react'

interface Props {
  searchParams: Promise<{
    channel: string
    space: string
  }>
}

async function ProjectPage({ searchParams }: Props) {

  const { channel:channelSlug, space:spaceSlug } = await searchParams


  const currentSpace = await  GetSpaceBySlugAction(spaceSlug, channelSlug)


  if (!currentSpace.success || !currentSpace.data) {
    return (
      <NotFound/>
    )
  }

  return (
    <ProjectScreen />
  )
}

export default ProjectPage