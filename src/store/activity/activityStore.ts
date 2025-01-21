import { ProfileActivity } from "@/src/components/Dashboard/Activity/types/activity.types.d"
import { atom } from "jotai"

const profileActivities = atom<ProfileActivity[]>([])

export const activityStore = {
  profileActivities
}
