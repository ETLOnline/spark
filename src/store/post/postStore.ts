import { SelectFilePost, SelectPollPost, SelectPost } from "@/src/db/schema"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import { atom } from "jotai"

const posts = atom<(SelectPost | SelectFilePost | SelectPollPost)[]>([])
const permissionCheckerAtom = atom<PermissionChecker | null>(null)

export const postStore = {
  posts,
  permissionCheckerAtom
}
