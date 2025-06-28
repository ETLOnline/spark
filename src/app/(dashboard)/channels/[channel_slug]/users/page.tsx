import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import {
  GetChannelBySlugAction,
  GetChannelUsersAction
} from "@/src/server-actions/Channel/Channel"
import React, { Suspense } from "react"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { getChannelRole } from "@/src/utils/channelRoleHelper"
import UnauthorizedAccessScreen from "@/src/components/common/UnauthorizedAccessScreen"
import { getUserRoles, isUserAdmin } from "@/src/utils/helpers"
import ChannelUserList from "@/src/components/UserListAndInvite/UserList"
import { getRoleByEntityTypeAndIdAction } from "@/src/server-actions/UserRoles/UserRole"

interface Props {
  params: Promise<{
    channel_slug: string
  }>
}

const ChannelUsersPage = async ({ params }: Props) => {
  const { channel_slug } = await params

  const currentChannel = await GetChannelBySlugAction(channel_slug)

  if (!currentChannel.success || !currentChannel.data) {
    return <NotFound />
  }

  const authUser = await AuthUserAction()
  const scopedRoles = (
    await getRoleByEntityTypeAndIdAction("CHANNEL", currentChannel.data.id)
  ).data

  if (authUser) {
    const channelRole = getChannelRole(currentChannel.data.id, authUser)
    const hasRole = scopedRoles
      ? scopedRoles.some((role) => role.name === channelRole)
      : false

    if (!hasRole) {
      return <UnauthorizedAccessScreen />
    }
  }

  const channelUsers = (await GetChannelUsersAction(currentChannel.data.id))
    .data

  return (
    <Suspense>
      <ChannelUserList
        entity={currentChannel.data}
        entityType="channel"
        userList={channelUsers || []}
        scopedRoles={scopedRoles || []}
      />
    </Suspense>
  )
}

export default ChannelUsersPage
