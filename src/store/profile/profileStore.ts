import { Tag } from "@/src/components/TagsInput/tags-input-types.d"
import { atom } from "jotai"

const bio = atom<string>("")
const skills = atom<Tag[]>([])
const interests = atom<Tag[]>([])

export const profileStore = {
  bio,
  skills,
  interests
}
