import { SelectFilePost, SelectPollPost, SelectPost } from "@/src/db/schema"
import { atom } from "jotai"

const posts = atom<(SelectPost | SelectFilePost | SelectPollPost)[]>([])

export const postStore = { posts }
