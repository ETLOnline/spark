import { Tag } from "@/src/components/dashboard/Profile/types/profile-types"
import { atom } from "jotai"

const bio = atom<string>("")
const skills = atom<Tag[]>([])
const interests = atom<Tag[]>([])

export const profileStore = {
  bio,
  skills,
  interests
}
