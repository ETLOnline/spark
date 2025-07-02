import React, { Suspense } from "react"
import {
  GetSpaceBySlugAction,
  GetSpaceUsersAction
} from "@/src/server-actions/Space/Space"
import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import ChannelUserList from "@/src/components/UserListAndInvite/UserList"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { getSpaceRole } from "@/src/utils/spaceRoleHelper"
import { isUserAdmin } from "@/src/utils/helpers"
import UnauthorizedAccessScreen from "@/src/components/common/UnauthorizedAccessScreen"
import { getRoleByEntityTypeAndIdAction } from "@/src/server-actions/UserRoles/UserRole"

interface Props {
  params: Promise<{
    channel_slug: string
    space_slug: string
  }>
}

async function SpaceUsersPage({ params }: Props) {
  const { space_slug, channel_slug } = await params

  const currentSpace = await GetSpaceBySlugAction(space_slug, channel_slug)
  if (!currentSpace.success || !currentSpace.data) {
    return <NotFound />
  }

  const authUser = await AuthUserAction()
  const spaceUsers = (await GetSpaceUsersAction(currentSpace.data.id)).data
  const scopedRoles = (
    await getRoleByEntityTypeAndIdAction("SPACE", currentSpace.data.id)
  ).data

  if (authUser) {
    const channelRole = getSpaceRole(currentSpace.data.id, authUser)
    const hasRole = scopedRoles
      ? scopedRoles.some((role) => role.name === channelRole)
      : false
    if (!hasRole) {
      return <UnauthorizedAccessScreen />
    }
  }
  return (
    <Suspense>
      <ChannelUserList
        entityType="space"
        entity={currentSpace.data}
        userList={spaceUsers || []}
        scopedRoles={scopedRoles || []}
      />
    </Suspense>
  )
}

export default SpaceUsersPage
