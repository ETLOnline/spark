import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
import React, { Suspense } from "react"
import SpaceSidebar from "./components/SpaceSidebar"
import { ScrollArea } from "@/src/components/ui/scroll-area"

interface Props {
  params: Promise<{
    channel_slug: string
    space_slug: string
  }>
  children: React.ReactNode
}

async function Layout({ params, children }: Props) {
  const { channel_slug, space_slug } = await params

  const currentSpace = await GetSpaceBySlugAction(
    space_slug,
    channel_slug,
    true
  )

  if (!currentSpace.success || !currentSpace.data) {
    return <NotFound />
  }

  return (
    <div className="grid grid-cols-12 w-full h-[80vh] overflow-hidden mt-0">
      <div className="col-span-2 border-r p-2 pl-0 overflow-y-auto">
        <SpaceSidebar space={currentSpace.data} />
      </div>

      <div className="col-span-10 overflow-hidden">
        <div className="grid grid-cols-1 h-full">
          <ScrollArea className="min-h-[80vh] p-4">{children}</ScrollArea>
        </div>
      </div>
    </div>
  )
}

export default Layout
