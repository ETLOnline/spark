import { ProfileActivity } from "@/src/components/Dashboard/Activity/types/activity.types"
import { atom } from "jotai"

const profileActivities = atom<ProfileActivity[]>([])

export const activityStore = {
  profileActivities
}
