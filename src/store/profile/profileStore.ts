import { Tag } from "@/src/components/TagsInput/tags-input-types"
import { atom } from "jotai"

const bio = atom<string>("")
const skills = atom<Tag[]>([])
const interests = atom<Tag[]>([])

export const profileStore = {
  bio,
  skills,
  interests
}
