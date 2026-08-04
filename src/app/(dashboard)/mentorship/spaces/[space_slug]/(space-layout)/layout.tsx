import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
import React from "react"
import SpaceSidebar from "@/src/app/(dashboard)/channels/[channel_slug]/spaces/[space_slug]/(space-layout)/components/SpaceSidebar"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { isSuperAdmin } from "@/src/utils/helpers"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import PrivatePage from "@/src/components/common/Overlay/PrivatePage"

interface Props {
  params: Promise<{
    space_slug: string
  }>
  children: React.ReactNode
}

async function Layout({ params, children }: Props) {
  const authUser = await AuthUserAction()
  const currentUserId = authUser?.unique_id
  const superAdmin = await isSuperAdmin(authUser)

  const { space_slug } = await params
  const decodedSpaceSlug = decodeURIComponent(space_slug)

  const currentSpace = await GetSpaceBySlugAction(decodedSpaceSlug, "", true)

  if (!currentSpace.success || !currentSpace.data) {
    return <NotFound />
  }
  const isUserMember =
    currentSpace.data?.space_type === "private"
      ? currentSpace.data?.users?.some((user) => user.user_id === currentUserId)
      : true

  const showAccessDeniedOverlay =
    currentSpace.data?.space_type === "private" && !isUserMember && !superAdmin
  if (showAccessDeniedOverlay) {
    return (
      <PrivatePage
        page="space"
        pageHref={`/profile/${currentSpace.data.created_by}`}
      />
    )
  }
  return (
    <div className="min-h-[calc(100vh-6rem)] bg-background">
      <div className="flex flex-col md:grid md:grid-cols-12 w-full h-[calc(100vh-6rem)] overflow-hidden">
        <div className="md:col-span-2 md:border-r md:p-2 md:pl-0 md:overflow-y-auto mb-2 border-b md:border-b-0 shrink-0">
          <SpaceSidebar space={currentSpace.data} />
        </div>

        <div className="flex-1 md:col-span-10 overflow-hidden min-h-0">
          <div className="grid grid-cols-1 h-full">
            <ScrollArea className="min-h-full px-3 md:px-4 ">
              {children}
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Layout
