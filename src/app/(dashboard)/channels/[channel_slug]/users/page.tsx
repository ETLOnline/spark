import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import {
  GetChannelBySlugAction,
  GetChannelUsersAction
} from "@/src/server-actions/Channel/Channel"
import React, { Suspense } from "react"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import UnauthorizedAccessScreen from "@/src/components/common/UnauthorizedAccessScreen"
import { isSuperAdmin } from "@/src/utils/helpers"
import ChannelUserList from "@/src/components/UserListAndInvite/UserList"
import { getRoleByEntityTypeAndIdAction } from "@/src/server-actions/UserRoles/UserRole"
import { SelectChannel } from "@/src/db/schema"

interface Props {
  params: Promise<{
    channel_slug: string
  }>
}

const ChannelUsersPage = async ({ params }: Props) => {
  const { channel_slug } = await params
  const decodedChannelSlug = decodeURIComponent(channel_slug)

  const currentChannel = await GetChannelBySlugAction(decodedChannelSlug)

  if (!currentChannel.success || !currentChannel.data) {
    return <NotFound />
  }

  const authUser = await AuthUserAction()
  const scopedRoles = (
    await getRoleByEntityTypeAndIdAction("CHANNEL", currentChannel.data.id)
  ).data

  const userChannelRole = authUser.roles.filter(
    (ur) =>
      ur.role.entity_type === "CHANNEL" &&
      ur.role.entity_id === currentChannel?.data?.id
  )

  if (authUser) {
    const hasRole = userChannelRole && userChannelRole.length > 0 ? true : false
    const superAdmin = await isSuperAdmin(authUser)

    if (!hasRole && !superAdmin) {
      return <UnauthorizedAccessScreen />
    }
  }

  const channelUsers = (await GetChannelUsersAction(currentChannel.data.id))
    .data

  return (
    <Suspense>
      {currentChannel?.data ? (
        <ChannelUserList
          entity={currentChannel.data as SelectChannel}
          entityType="channel"
          userList={channelUsers || []}
          scopedRoles={scopedRoles || []}
        />
      ) : null}
    </Suspense>
  )
}

export default ChannelUsersPage
