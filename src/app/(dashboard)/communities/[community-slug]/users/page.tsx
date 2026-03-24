import React, { Suspense } from "react"
import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import UnauthorizedAccessScreen from "@/src/components/common/UnauthorizedAccessScreen"
import ChannelUserList from "@/src/components/UserListAndInvite/UserList"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { isSuperAdmin } from "@/src/utils/helpers"
import { getRoleByEntityTypeAndIdAction } from "@/src/server-actions/UserRoles/UserRole"

import {
  GetCommunityDetailsAction,
  GetCommunityUsersAction
} from "@/src/server-actions/Community/Community"

interface Props {
  params: Promise<{
    "community-slug": string
  }>
}

const CommunityUsersPage = async ({ params }: Props) => {
  const communitySlug = await params
  const communitySlugValue = communitySlug["community-slug"]

  const DecodedCommunitySlug = decodeURIComponent(communitySlugValue)

  const currentCommunity = await GetCommunityDetailsAction(DecodedCommunitySlug)

  if (!currentCommunity) {
    return <NotFound />
  }

  const authUser = await AuthUserAction()

  const scopedRoles = (
    await getRoleByEntityTypeAndIdAction("COMMUNITY", currentCommunity.id)
  ).data

  const communityUsers = (await GetCommunityUsersAction(currentCommunity.id))
    .data

  return (
    <Suspense>
      <ChannelUserList
        entity={currentCommunity}
        entityType="community"
        userList={communityUsers || []}
        scopedRoles={scopedRoles || []}
      />
    </Suspense>
  )
}

export default CommunityUsersPage
