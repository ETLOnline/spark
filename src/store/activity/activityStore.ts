import { ProfileActivity } from "@/src/components/Dashboard/ProfileActivity/types/activity.types"
import { atom } from "jotai"

const profileActivities = atom<ProfileActivity[]>([])

export const activityStore = {
  profileActivities
}
