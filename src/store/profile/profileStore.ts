import { Tag } from "@/src/components/TagsInput/tags-input-types"
import { SelectTag } from "@/src/db/schema"
import { atom } from "jotai"

const bio = atom<string>("")
const skills = atom<SelectTag[]>([])
const interests = atom<SelectTag[]>([])

export const profileStore = {
  bio,
  skills,
  interests
}
