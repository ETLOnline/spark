import { ProfileActivity } from "@/src/components/Dashboard/Connections/types/connections.types"
import { atom } from "jotai"

const incomingProfileActivities = atom<ProfileActivity[]>([])
const outgoingProfileActivities = atom<ProfileActivity[]>([])

export const activityStore = {
  incomingProfileActivities,
  outgoingProfileActivities
}
