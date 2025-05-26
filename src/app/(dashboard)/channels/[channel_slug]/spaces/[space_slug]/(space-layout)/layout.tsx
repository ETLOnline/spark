import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
import React, { Suspense } from "react"
import SpacesStats from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/SpacesStats"
import SpaceHeader from "./components/spaceHeader"

interface Props {
  params: Promise<{
    channel_slug: string
    space_slug: string
  }>
  children: React.ReactNode
}

async function Layout({ params, children }: Props) {
  const { channel_slug, space_slug } = await params

  const currentSpace = await GetSpaceBySlugAction(space_slug, channel_slug)

  if (!currentSpace.success || !currentSpace.data) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col space-y-4 w-full">
      <div className="flex-grow flex justify-center items-start space-x-4">
        <main className="grow space-y-4 post-feed">
          <SpaceHeader currentSpace={currentSpace.data} />
          <Suspense>{children}</Suspense>
        </main>
        {/* <SpacesStats /> */}
      </div>
    </div>
  )
}

export default Layout
