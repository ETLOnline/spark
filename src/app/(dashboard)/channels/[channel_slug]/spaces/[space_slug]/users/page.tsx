import React, { Suspense } from 'react'
import { GetSpaceBySlugAction, GetSpaceUsersAction } from '@/src/server-actions/Space/Space'
import NotFound from '@/src/components/Dashboard/NotFound/NotFound'
import ChannelUserList from '@/src/components/UserListAndInvite/UserList'
import { AuthUserAction } from '@/src/server-actions/User/AuthUserAction'
import { getSpaceRole } from '@/src/utils/spaceRoleHelper'
import { isUserAdmin } from '@/src/utils/helpers'
import UnauthorizedAccessScreen from '@/src/components/common/UnauthorizedAccessScreen'

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
    return (
      <NotFound />
    )
  }


  const authUser = await AuthUserAction()

  if (authUser) {

    const channelRole = getSpaceRole(currentSpace.data.id, authUser)

    if (!channelRole?.includes('admin') && !isUserAdmin(authUser)) {
      return (
        <UnauthorizedAccessScreen />
      )
    }
  }

  const spaceUsers = (await GetSpaceUsersAction(currentSpace.data.id)).data

  return (
    <Suspense>
      <ChannelUserList entityType='space' entity={currentSpace.data} userList={spaceUsers || []} />
    </Suspense>
  )
}

export default SpaceUsersPage