import { Tag } from "@/src/components/dashboard/profile/types/profile-types.d"
import { atom } from "jotai"

const bio = atom<string>("")
const skills = atom<Tag[]>([])
const interests = atom<Tag[]>([])

export const profileStore = {
  bio,
  skills,
  interests
}
