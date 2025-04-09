import NotFound from '@/src/components/Dashboard/NotFound/NotFound'
import { GetChannelBySlugAction, GetChannelUsersAction } from '@/src/server-actions/Channel/Channel'
import React, { Suspense } from 'react'
import { AuthUserAction } from '@/src/server-actions/User/AuthUserAction'
import { getChannelRole } from '@/src/utils/channelRoleHelper'
import UnauthorizedAccessScreen from '@/src/components/common/UnauthorizedAccessScreen'
import { getUserRoles, isUserAdmin } from '@/src/utils/helpers'
import ChannelUserList from '@/src/components/UserListAndInvite/UserList'

interface Props {
  params: Promise<{
    channel_slug: string
  }>
}

const ChannelUsersPage = async ({ params }: Props) => {


  const { channel_slug } = await params

  const currentChannel = await GetChannelBySlugAction(channel_slug)

  if (!currentChannel.success || !currentChannel.data) {
    return (
      <NotFound />
    )
  }

  const authUser = await AuthUserAction()

  // if (authUser) {

  //   const channelRole = getChannelRole(currentChannel.data.id, authUser)

  //   if (!channelRole || (!channelRole.includes('admin') && !isUserAdmin(authUser))) {
  //     return (
  //       <UnauthorizedAccessScreen />
  //     )
  //   }
  // }

  const channelUsers = (await GetChannelUsersAction(currentChannel.data.id)).data

  return (
    <Suspense>
      <ChannelUserList entity={currentChannel.data} entityType='channel' userList={channelUsers || []} />
    </Suspense>
  )
}

export default ChannelUsersPage