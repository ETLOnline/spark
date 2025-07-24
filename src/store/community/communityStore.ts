import { atom } from "jotai"
import { GetCommunitiesActionResponse } from "@/src/server-actions/Community/Community"
import { PaginationType } from "@/src/components/common/types/pagination.type" // Ensure this is imported
import { SelectCommunity } from "@/src/db/schema"

type CommunityStoreType = {
  communities: GetCommunitiesActionResponse | null
  communityFormModalVisibility: boolean
  selectedCommunity: SelectCommunity | null
  refreshCommunitiesTriggerAtom: boolean
}

const defaultPagination: PaginationType = {
  total: 0,
  page: 1,
  limit: 6,
  totalPages: 0
}

const initialCommunityState: CommunityStoreType = {
  communities: {
    communities: [],
    joinedCommunities: [],
    allCommunitiesPagination: defaultPagination,
    joinedCommunitiesPagination: defaultPagination,
    joinedCount: 0
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
