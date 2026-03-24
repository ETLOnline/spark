import { SelectCommunityRequest } from "@/src/db/schema"
import { atom } from "jotai"

const CommunityRequests = atom<SelectCommunityRequest[]>([])

export const communityRequestsStore = {
  CommunityRequests
}
