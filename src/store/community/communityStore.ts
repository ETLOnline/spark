// src/store/community/communityStore.ts

import { atom } from "jotai"
import { SelectCommunity } from "@/src/db/schema"
import { GetCommunitiesActionResponse } from "@/src/server-actions/Community/Community"

type CommunityStoreType = {
  communities: GetCommunitiesActionResponse | null
  communityFormModalVisibility: boolean
  selectedCommunity: SelectCommunity | null
  refreshCommunitiesTriggerAtom: boolean
}

const initialCommunityState: CommunityStoreType = {
  communities: {
    communities: [],
    joinedCommunities: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 6,
      totalPages: 0
    }
  },
  communityFormModalVisibility: false,
  selectedCommunity: null,
  refreshCommunitiesTriggerAtom: false
}

export const communityStore = {
  communities: atom(initialCommunityState.communities),
  communityFormModalVisibility: atom(
    initialCommunityState.communityFormModalVisibility
  ),
  selectedCommunity: atom(initialCommunityState.selectedCommunity),
  refreshCommunitiesTriggerAtom: atom(
    initialCommunityState.refreshCommunitiesTriggerAtom
  )
}
